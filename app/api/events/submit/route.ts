import { NextRequest, NextResponse } from "next/server";
import { isRecord, validateEventSubmission } from "@/helpers/eventSubmission";

export async function POST(request: NextRequest) {
  const fail = (error: string, status: number) =>
    NextResponse.json({ ok: false, error }, { status });
  const origin = request.headers.get("origin");
  if (origin !== request.nextUrl.origin) {
    return fail("Ongeldige herkomst van de aanvraag.", 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return fail("Verstuur de aanvraag als JSON.", 415);
  }
  if (Number(request.headers.get("content-length")) > 8192) {
    return fail("De aanvraag is te groot.", 413);
  }
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) {
      return fail("Ongeldige aanvraag.", 400);
    }
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = "";
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) {
        break;
      }
      bytes += chunk.value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return fail("De aanvraag is te groot.", 413);
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    body = JSON.parse(text);
  } catch {
    return fail("Ongeldige aanvraag.", 400);
  }
  const submission = validateEventSubmission(body);
  if ("error" in submission) {
    return fail(submission.error, 400);
  }
  const endpoint = "https://api.carnaval-radio.nl/api/events";
  const token = process.env.STRAPI_EVENT_SUBMISSION_TOKEN;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES || "").split(",").map((host) => host.trim()).filter(Boolean),
  );
  if (!token || !secret || hostnames.size === 0) {
    console.error("Event submission configuration is incomplete.");
    return fail("Evenementen aanmelden is tijdelijk niet beschikbaar.", 503);
  }
  if (!hostnames.has(request.nextUrl.hostname) ||
      (process.env.NODE_ENV === "production" &&
       (hostnames.has("localhost") || hostnames.has("127.0.0.1")))) {
    return fail("Evenementen aanmelden is niet beschikbaar op deze host.", 403);
  }
  try {
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: submission.token }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!verification.ok) {
      console.error("Event spam verification failed with HTTP status", verification.status);
      return fail("De spamcontrole is tijdelijk niet beschikbaar.", 503);
    }
    const result: unknown = await verification.json();
    if (!isRecord(result) || result.success !== true ||
        result.action !== "event-submit" || result.hostname !== request.nextUrl.hostname ||
        typeof result.hostname !== "string" || !hostnames.has(result.hostname)) {
      return fail("De spamcontrole is niet gelukt. Probeer de controle opnieuw.", 400);
    }
  } catch {
    console.error("Event spam verification could not be completed.");
    return fail("De spamcontrole is tijdelijk niet beschikbaar.", 503);
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: submission.data }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) {
      console.error("Strapi event submission failed with HTTP status", response.status);
      return fail("Het evenement kon niet worden opgeslagen. Neem contact met ons op.", 502);
    }
    const result: unknown = await response.json();
    const data = isRecord(result) ? result.data : null;
    const attributes = isRecord(data) ? data.attributes : null;
    if (!isRecord(data) || typeof data.id !== "number" || !isRecord(attributes) ||
        attributes.publishedAt !== null || attributes.IsHighlighted !== false ||
        !Object.entries(submission.data).every(([field, value]) => attributes[field] === value)) {
      console.error("Strapi did not confirm the expected event draft; manual review required.");
      return fail("We konden de conceptstatus niet bevestigen. Neem contact met ons op voordat je opnieuw inzendt.", 502);
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    console.error("Strapi event submission could not be confirmed; manual review may be required.");
    return fail("We konden de inzending niet bevestigen. Neem contact met ons op voordat je opnieuw inzendt.", 502);
  }
}

export type EventDraft = {
  Title: string;
  Date: string;
  Address: string;
  Link: string | null;
  IsHighlighted: false;
  publishedAt: null;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateEventSubmission(
  body: unknown,
  now = Date.now(),
): { data: EventDraft; token: string } | { error: string } {
  if (!isRecord(body)) {
    return { error: "Ongeldige aanvraag." };
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  if (title.length < 3 || title.length > 120) {
    return { error: "De naam moet tussen 3 en 120 tekens bevatten." };
  }
  if (address.length < 3 || address.length > 200) {
    return { error: "De locatie moet tussen 3 en 200 tekens bevatten." };
  }
  let link: string | null = null;
  if (body.link !== undefined && body.link !== "") {
    if (typeof body.link !== "string" || body.link.length > 2048) {
      return { error: "Vul een geldige informatielink in (maximaal 2048 tekens)." };
    }
    try {
      const url = new URL(body.link.trim());
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
        return { error: "De informatielink moet een http- of https-adres zijn." };
      }
      link = url.href;
    } catch {
      return { error: "Vul een geldige informatielink in." };
    }
  }
  if (
    typeof body.localDateTime !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(body.localDateTime)
  ) {
    return { error: "Vul een geldige datum en tijd in." };
  }
  const local = body.localDateTime;
  const nominal = Date.parse(`${local}:00Z`);
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  // Round-trip both Dutch UTC offsets to reject invalid and ambiguous DST times.
  const candidates = [1, 2]
    .map((offset) => nominal - offset * 60 * 60 * 1000)
    .filter((time) => Number.isFinite(time) && formatter.format(time).replace(" ", "T") === local);
  if (candidates.length !== 1) {
    return { error: "Deze Nederlandse datum/tijd is ongeldig of dubbel door de klokwisseling. Kies een andere tijd." };
  }
  if (candidates[0] <= now) {
    return { error: "Het evenement moet in de toekomst plaatsvinden." };
  }
  if (typeof body.turnstileToken !== "string" || !body.turnstileToken || body.turnstileToken.length > 2048) {
    return { error: "Voltooi de spamcontrole." };
  }
  return {
    data: {
      Title: title,
      Date: new Date(candidates[0]).toISOString(),
      Address: address,
      Link: link,
      IsHighlighted: false,
      publishedAt: null,
    },
    token: body.turnstileToken,
  };
}

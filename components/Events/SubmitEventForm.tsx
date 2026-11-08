"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import Link from "next/link";
import { isRecord } from "@/helpers/eventSubmission";

type Turnstile = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    action: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export default function SubmitEventForm({ siteKey }: { siteKey: string | undefined }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string>();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  useEffect(() => {
    if (!ready || !siteKey || !container.current || !window.turnstile) {
      return;
    }
    widget.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action: "event-submit",
      callback: (value) => { setToken(value); setCaptchaError(""); },
      "expired-callback": () => setToken(""),
      "error-callback": () => {
        setToken("");
        setCaptchaError("De spamcontrole kon niet laden. Vernieuw de pagina of neem contact op.");
      },
    });
    return () => {
      if (widget.current !== undefined) {
        window.turnstile?.remove(widget.current);
        widget.current = undefined;
      }
    };
  }, [ready, siteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !token) {
      return;
    }
    const form = event.currentTarget;
    const fields = new FormData(form);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.get("title"),
          localDateTime: fields.get("localDateTime"),
          address: fields.get("address"),
          link: fields.get("link"),
          turnstileToken: token,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !isRecord(result) || result.ok !== true) {
        setError(isRecord(result) && typeof result.error === "string"
          ? result.error : "Het aanmelden is niet gelukt. Neem contact met ons op.");
        return;
      }
      setSuccess(true);
      form.reset();
    } catch {
      setError("We konden de inzending niet bevestigen. Neem contact met ons op voordat je opnieuw inzendt.");
    } finally {
      setPending(false);
      setToken("");
      if (widget.current !== undefined) {
        window.turnstile?.reset(widget.current);
      }
    }
  }

  const inputClass = "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30";
  return (
    <section id="evenement-aanmelden" aria-labelledby="submit-event-heading" className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
      <h2 id="submit-event-heading" className="text-2xl font-bold text-gray-900">Evenement aanmelden</h2>
      <p className="mt-2 text-gray-700">Organiseer je een carnavalsevenement? Meld het hier aan. Onze redactie beoordeelt je inzending voordat deze in de agenda verschijnt.</p>
      {!siteKey ? (
        <p className="mt-4 text-gray-700">Aanmelden via het formulier is tijdelijk niet beschikbaar. <Link href="/contact" className="font-semibold text-secondary underline">Neem contact op</Link>.</p>
      ) : success ? (
        <p role="status" className="mt-4 font-semibold text-secondary">Bedankt! Je evenement is als concept ontvangen. Onze redactie beoordeelt het; het staat nog niet openbaar in de agenda.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 max-w-2xl space-y-4">
          <fieldset disabled={pending} className="space-y-4">
            <label className="block font-medium text-gray-800">Naam evenement
              <input name="title" required minLength={3} maxLength={120} className={inputClass} />
            </label>
            <label className="block font-medium text-gray-800">Datum en begintijd
              <input name="localDateTime" type="datetime-local" required aria-describedby="event-time-help" className={inputClass} />
            </label>
            <p id="event-time-help" className="text-sm text-gray-600">Vul de Nederlandse tijd in (Europe/Amsterdam), ook als je zelf in een andere tijdzone bent.</p>
            <label className="block font-medium text-gray-800">Locatie en plaats
              <input name="address" required minLength={3} maxLength={200} placeholder="Bijvoorbeeld: Brikke Oave, Brunssum" className={inputClass} />
            </label>
            <label className="block font-medium text-gray-800">Informatielink (optioneel)
              <input name="link" type="url" maxLength={2048} placeholder="https://" className={inputClass} />
            </label>
          </fieldset>
          <p className="text-sm text-gray-600">Voor spamcontrole gebruiken we Cloudflare Turnstile. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="underline">Privacyinformatie</a>.</p>
          <div ref={container} />
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => setCaptchaError("De spamcontrole kon niet laden. Vernieuw de pagina of neem contact op.")} />
          {captchaError && <p role="alert" className="text-red-700">{captchaError}</p>}
          {error && <p role="alert" className="text-red-700">{error} <Link href="/contact" className="underline">Contact</Link></p>}
          <button type="submit" disabled={pending || !token} className="rounded-full bg-secondary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? "Bezig met aanmelden..." : "Verstuur ter beoordeling"}
          </button>
        </form>
      )}
    </section>
  );
}

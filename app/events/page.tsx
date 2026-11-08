import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../fonts/font";
import EventsList from "@/components/Events/EventsList";
import SubmitEventForm from "@/components/Events/SubmitEventForm";
import EventsStructuredData from "@/components/Events/EventsStructuredData";
import { fetchEvents } from "@/GlobalState/ApiCalls/fetchEvents";
import Link from "next/link";
import { pageMetadata } from "@/helpers/seo";

export function generateMetadata() {
  return pageMetadata(
    "Evenementen en carnavalsfeesten | Carnaval Radio",
    "Ontdek aankomende carnavalsevenementen en feesten bij Carnaval Radio. Bekijk datums, locaties en eerdere evenementen rond de Limburgse Vastelaovend.",
    "/evenementen",
  );
}

const Page = async () => {
  const events = await fetchEvents();
  const currentDate = new Date();

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.Date);
    return eventDate >= currentDate;
  });

  const pastEvents = events
    .filter((event) => {
      const eventDate = new Date(event.Date);
      return eventDate < currentDate;
    })
    .reverse();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10">
      <EventsStructuredData events={[...upcomingEvents, ...pastEvents]} />
      <header className="mb-10 rounded-3xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <BsFileMusicFill
              aria-hidden="true"
              className="text-2xl text-secondary"
            />
          </span>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
            Carnaval Radio agenda
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h1 className={`text-4xl font-bold text-gray-900 sm:text-5xl ${Indie.className}`}>
            Evenementen
          </h1>
          <Link
            className="inline-flex min-h-11 items-center text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            href="#evenement-aanmelden"
          >
            Jouw evenement erbij? Meld het aan
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
          Van feestavonden tot live optredens: ontdek waar je samen Vastelaovend
          kunt vieren.
        </p>
      </header>

      <section className="mb-12" aria-labelledby="upcoming-events-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="upcoming-events-heading"
              className={`text-2xl font-bold text-gray-900 sm:text-3xl ${Indie.className}`}
            >
              Aankomende evenementen
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Zet de leukste momenten alvast in je agenda.
            </p>
          </div>
          <span className="rounded-full bg-secondaryShade_1 px-3 py-1.5 text-sm font-semibold text-secondary">
            {upcomingEvents.length}{" "}
            {upcomingEvents.length === 1 ? "evenement" : "evenementen"}
          </span>
        </div>
        <EventsList events={upcomingEvents} />
      </section>

      <section className="mb-10" aria-labelledby="past-events-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="past-events-heading"
              className={`text-2xl font-bold text-gray-900 sm:text-3xl ${Indie.className}`}
            >
              Eerdere evenementen
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Nog even nagenieten van wat er is geweest.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600">
            {pastEvents.length}{" "}
            {pastEvents.length === 1 ? "evenement" : "evenementen"}
          </span>
        </div>
        <EventsList events={pastEvents} />
      </section>

      <SubmitEventForm siteKey={
        process.env.STRAPI_EVENT_SUBMISSION_TOKEN &&
        process.env.TURNSTILE_SECRET_KEY &&
        process.env.TURNSTILE_HOSTNAMES
          ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
          : undefined
      } />
    </main>
  );
};

export default Page;

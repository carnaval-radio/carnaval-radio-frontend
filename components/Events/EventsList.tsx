import React from "react";
import { MdEvent, MdLocationOn, MdOpenInNew } from "react-icons/md";
import Image from "next/image";
import type { Event } from "@/GlobalState/ApiCalls/fetchEvents";

type EventsProps = {
  events: Event[];
  loading?: boolean;
};

const getEventLink = (link: string | null | undefined) => {
  if (!link) {
    return null;
  }

  const value = link.trim();

  if (value.startsWith("/") && !value.startsWith("//")) {
    return { href: value, external: false };
  }

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return { href: value, external: true };
    }
  } catch {
    return null;
  }

  return null;
};

const EventsList: React.FC<EventsProps> = ({ events, loading = false }) => {
  if (loading) {
    return <EventsLoading />;
  }

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center text-gray-600">
        Geen evenementen gevonden.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {events.map((event) => {
        const eventDate = new Date(event.Date);
        const dateIsValid = !Number.isNaN(eventDate.getTime());
        const eventLink = getEventLink(event.Link);
        const month = dateIsValid
          ? new Intl.DateTimeFormat("nl-NL", { month: "short" })
              .format(eventDate)
              .replace(".", "")
          : null;
        const dateLabel = dateIsValid
          ? new Intl.DateTimeFormat("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(eventDate)
          : "Datum onbekend";
        const timeLabel = dateIsValid
          ? new Intl.DateTimeFormat("nl-NL", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(eventDate)
          : null;

        return (
          <article
            key={event.id}
            className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              event.IsHighlighted
                ? "border-primary/50 border-l-4 border-l-secondary bg-gradient-to-br from-primary/10 via-white to-secondary/5"
                : "border-gray-200 hover:border-primary/40"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                aria-hidden="true"
                className={`flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-xl ${
                  event.IsHighlighted
                    ? "bg-primary text-white"
                    : "bg-secondaryShade_1 text-secondary"
                }`}
              >
                {dateIsValid ? (
                  <>
                    <span className="text-2xl font-bold leading-none">
                      {eventDate.getDate()}
                    </span>
                    <span className="mt-1 text-xs font-semibold uppercase tracking-wide">
                      {month}
                    </span>
                  </>
                ) : (
                  <MdEvent aria-hidden="true" size={26} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {event.IsHighlighted && (
                  <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 py-1 pl-1.5 pr-3 text-xs font-bold text-secondary shadow-sm">
                    <Image
                      src="/carnaval-radio-logo.png"
                      alt=""
                      width={44}
                      height={26}
                      className="h-[1.4rem] w-11 object-contain"
                    />
                    Carnaval Radio
                  </span>
                )}
                <h3 className="break-words text-lg font-bold leading-snug text-gray-900">
                  {event.Title}
                </h3>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  <time dateTime={event.Date}>
                    {dateLabel}
                    {timeLabel && ` · ${timeLabel} uur`}
                  </time>
                </p>
              </div>
            </div>

            {event.Address && (
              <p className="mt-5 flex items-start gap-2 text-sm text-gray-700">
                <MdLocationOn
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-lg text-secondary"
                />
                <span className="break-words">{event.Address}</span>
              </p>
            )}

            {eventLink && (
              <a
                href={eventLink.href}
                target={eventLink.external ? "_blank" : undefined}
                rel={eventLink.external ? "noopener noreferrer" : undefined}
                className="mt-auto inline-flex w-fit items-center gap-1 pt-5 text-sm font-semibold text-secondary transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Meer informatie
                {eventLink.external && (
                  <MdOpenInNew aria-hidden="true" className="text-base" />
                )}
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
};

const EventsLoading = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
      />
    ))}
  </div>
);

export default EventsList;

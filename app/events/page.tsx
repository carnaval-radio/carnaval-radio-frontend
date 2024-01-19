import React from "react";
import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../fonts/font";
import EventsList from "@/components/Events/EventsList";
import { fetchEvents } from "@/GlobalState/ApiCalls/fetchEvents";
import Link from "next/link";

const page = async () => {
  const events = await fetchEvents();
  const currentDate = new Date();

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.Date);
    return eventDate >= currentDate;
  });

  const pastEvents = events.filter((event) => {
    const eventDate = new Date(event.Date);
    return eventDate < currentDate;
  }).reverse();

  return (
    <div className="p-10">
      <div className="flex items-center gap-2 mb-4">
        <BsFileMusicFill className="text-2xl text-secondary" />
        <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
          Evenementen
        </h2>
      </div>

      <h3 className="text-xl font-semibold">Aankomende evenementen:</h3>
      <EventsList events={upcomingEvents} />

      <h3 className="text-xl font-semibold">Eerdere evenementen</h3>
      <EventsList events={pastEvents} />

      <p className="p-10">
        Wil je jouw evenement hier ook tussen hebben staan? Neem dan{" "}
        <Link className="text-secondary" href="contact">
          contact
        </Link>{" "}
        op
      </p>
    </div>
  );
};

export default page;

import React, { Fragment } from "react";
import { MdEvent } from "react-icons/md";
import { Event } from "@/GlobalState/ApiCalls/fetchEvents";
import DateAndTime from "../DateAndTime";
import Image from "next/image";

type EventsProps = {
  events: Event[];
  loading?: boolean;
};

const EventsList: React.FC<EventsProps> = ({ events, loading = null }) => {
  return (
    <div>
      {!loading ? (
        <>
          {events?.map((event: Event, i: any) => (
            <Fragment key={"frag" + i}>
              <div className="w-full grid grid-cols-12 gap-4 py-2">
                <div className="col-span-10 md:col-span-3 flex items-center">
                  <MdEvent
                    size={24}
                    className="mr-2"
                  />
                  <div
                    className={`py-2 px-4 rounded-full ${
                      i % 2 !== 0 ? "bg-tertiaryShade_1" : "bg-secondaryShade_1"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        i % 2 !== 0 ? "text-tertiary" : "text-secondary"
                      }`}
                    >
                      <DateAndTime date={new Date(event.Date)} />
                    </p>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  {event.IsHighlighted && (
                    <div className="mr-4 w-10">
                      <Image
                        width={32}
                        height={32}
                        src="https://res.cloudinary.com/dwzn0q9wj/image/upload/w_32,h_32/logo_square_512_1_78657ec246"
                        alt={event.Title}
                      />
                    </div>
                  )}
                </div>
                <div
                  className={`col-span-12 md:col-span-6 ${
                    event.IsHighlighted ? "font-bold" : ""
                  }`}
                >
                  <p>{event.Title}</p>
                </div>
                <div className="col-span-12 md:col-span-2 text-[16px] hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-secondary font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {event.Address}
                </div>
              </div>
              <div className="w-full h-[1px]  bg-gray-100"></div>
            </Fragment>
          ))}
        </>
      ) : (
        <EventsLoading />
      )}
    </div>
  );
};

const EventsLoading = () => {
  const arr = [1, 2, 3, 4];
  return (
    <>
      {arr.map((_, i) => (
        <div key={"recentSongLoading" + i} className="flex flex-col">
          <div className="flex items-center justify-between p-2 bg-gray-200 animate-pulse">
            <div className="flex space-x-3">
              <div className="h-9 w-9 rounded-full bg-gray-100"></div>
              <div className="flex flex-col gap-1">
                <div className="h-7 w-[200px] bg-gray-100 rounded-md"></div>
                <div className="h-4 w-24 bg-gray-100 rounded-md"></div>
              </div>
            </div>
            <div className={`py-4 px-8 rounded-full bg-greenShade_1`}></div>
          </div>
          <div className="w-full h-[1px] bg-gray-200"></div>
        </div>
      ))}
    </>
  );
};

export default EventsList;

const DateAndTime = ({
  timestamp,
  date,
  dense = false,
  compact = false,
}: {
  timestamp?: number;
  date?: Date;
  dense?: boolean;
  compact?: boolean;
}) => {
  const currentDate = new Date();
  let formattedTimestamp = new Date();

  if (timestamp) {
    // Timestamp is already in milliseconds, just create Date object directly
    formattedTimestamp = new Date(timestamp);
  } else if (date) {
    formattedTimestamp = date;
    formattedTimestamp.setHours(formattedTimestamp.getHours() + 1);
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
  };

  const isToday =
    currentDate.getDate() === formattedTimestamp.getDate() &&
    currentDate.getMonth() === formattedTimestamp.getMonth() &&
    currentDate.getFullYear() === formattedTimestamp.getFullYear();

  if (dense) {
    return formattedTimestamp.toLocaleTimeString("nl-NL", options);
  }

  if (compact) {
    if (isToday) {
      return formattedTimestamp.toLocaleTimeString("nl-NL", options);
    }

    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    if (formattedTimestamp.toDateString() === yesterday.toDateString()) {
      return <>Gisteren {formattedTimestamp.toLocaleTimeString("nl-NL", options)}</>;
    }

    return formattedTimestamp.toLocaleString("nl-NL", {
      ...options,
      day: "numeric",
      month: "short",
    });
  }

  if (isToday) {
    return (
      <>
        <span className="hidden md:inline-block lg:hidden xl:inline-block">
          Vandaag om
        </span>{" "}
        {formattedTimestamp.toLocaleTimeString("nl-NL", options)}
      </>
    ); // Today
  }

  const isYesterday =
    currentDate.getDate() - 1 === formattedTimestamp.getDate() &&
    currentDate.getMonth() === formattedTimestamp.getMonth() &&
    currentDate.getFullYear() === formattedTimestamp.getFullYear();

  if (isYesterday) {
    return (
      <>
        <span className="hidden md:inline-block">Gisteren om</span>{" "}
        {formattedTimestamp.toLocaleTimeString("nl-NL", options)}
      </>
    );
  }

  options.day = "numeric";
  options.month = "long"; // Display full month name (e.g., "september")

  return <>{formattedTimestamp.toLocaleTimeString("nl-NL", options)}</>;
};

export default DateAndTime;

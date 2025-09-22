"use client";
import Image from "next/image";
import { TeamMember as TeamMemberType } from "@/types/teamTypes";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { getInitials, getRandomColor } from "@/helpers/randomColor";

interface Props {
  data: TeamMemberType;
  showDetailedInformation?: boolean;
  index?: number;
}

function generateTeamId(url: string): string | undefined {
  return url.slice(url.indexOf("#") + 1);
}

const TeamMember = ({
  data,
  showDetailedInformation = false,
  index = 0,
}: Props) => {
  const person = data.attributes;

  const initialsBackgroundColor = person.Color || getRandomColor(person.Name);
  
  function getTextColor(backgroundColor: string): string {
    // Convert the background color to RGB values
    const rgb = backgroundColor.match(/\d+/g);
    if (!rgb) return "black";

    // Calculate the relative luminance
    const luminance = (0.299 * parseInt(rgb[0]) + 0.587 * parseInt(rgb[1]) + 0.114 * parseInt(rgb[2])) / 255;

    // Determine the text color based on the luminance
    return luminance > 0.5 ? "black" : "white";
  }

  const initialsTextColor = getTextColor(initialsBackgroundColor);

  const cardBackgroundColor = `bg-primaryShade_3`;

  const joinedYear = new Date(person.DateJoined).getFullYear(); // Get the year the person joined

  const birthdate = new Date(person.Birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();

  // Adjust the age if the birthdate hasn't occurred yet this year
  if (today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())) {
    age--;
  }
  
  return (
    <li
      key={person.Name}
      className={`rounded-2xl ${cardBackgroundColor} px-8 py-5`}
    >
      {person?.Photo.data?.attributes?.url ? (
        <Image
          id={generateTeamId(person.Slug)}
          width="0"
          height="0"
          src={person?.Photo.data?.attributes?.url}
          alt={person.Name}
          sizes="404px"
          priority
          className="mx-auto h-48 w-48 rounded-full md:h-56 md:w-56"
          blurDataURL={person.Photo.data?.attributes?.url}
        />
      ) : (
        <div
          style={{ backgroundColor: initialsBackgroundColor, color: initialsTextColor }}
          id={generateTeamId(person.Slug)}
          className={`mx-auto h-48 w-48 rounded-full md:h-56 md:w-56 relative inline-flex items-center justify-center py-10 overflow-hidden`}
        >
          <span className="text-7xl font-semibold ease-linear tracking-widest ">
            {getInitials(person.Name)}
          </span>
        </div>
      )}
      <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-black">
        {person.Name}
      </h3>
      {/* <p className="mt-2 text-sm leading-6 text-gray-500">
        {person.Story && <BlocksRenderer content={person.Story as any} />}
      </p> */}
      <ul role="list" className="mt-6 flex justify-center gap-x-6">
        {person.Phone && (
          <li>
            <a
              href={"tel:" + person.Phone}
              className="text-gray-600 hover:text-gray-500"
            >
              <span className="sr-only">Telefoon</span>
                            <FaPhone className="text-contactIcon" width="20" height="20" />
            </a>
          </li>
        )}
        {person.Email && (
        <li>
          <a
            href={"mailto:" + person.Email}
            className="text-gray-600 hover:text-gray-500"
          >
            <span className="sr-only">E-mail</span>
            <FaEnvelope className="text-contactIcon" width="20" height="20" />
          </a>
        </li>)}
      </ul>
      {joinedYear && age && person.Role && (
      <div className="flex flex-wrap mt-5 gap-3">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{person.Role}</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{joinedYear}</span>        
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{person.City}</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{age} jaar</span>
        {person.NickName && <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{person.NickName}</span>}
      </div>)}      
    </li>
  );
};

export default TeamMember;

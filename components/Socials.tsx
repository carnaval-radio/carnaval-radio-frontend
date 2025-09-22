import React from "react";
import Image from "next/image";
import Link from "next/link";

const socialsData = [
  {
    iconImg: "/icons/facebook.png",
    iconName: "Facebook",
    link: "https://www.facebook.com/carnavalradio/",
  },
  {
    iconImg: "/icons/instagram.png",
    iconName: "Instagram",
    link: "https://www.instagram.com/carnaval.radio",
  },
  {
    iconImg: "/icons/youtube.png",
    iconName: "Youtube",
    link: "https://www.youtube.com/carnavalsradio",
  },
];

const Socials = ({ options }: any) => {
  return (
    <div
      className={`${
        options === "sidebar"
          ? "ml-5 mt-4 mb-4 mr-5 bg-primaryShade_3 p-4 border-3 border-white rounded-lg"
          : "mt-8"
      }`}
    >
      {options === "sidebar" && <h2 className="font-semibold">Volg ons op:</h2>}
      <div className="mt-3 flex items-center justify-between gap-1">
        {socialsData.map((icon, i) => (
          <Link
            href={icon.link}
            target="_blank"
            key={"socialLink" + i}
            className={`p-3 rounded-full ${
              options === "footer" ? "bg-secondaryShade_2" : "bg-white"
            } `}
          >
            <Image
              className={`${
                options === "footer" && "filter grayscale"
              } hover:scale-95`}
              src={icon.iconImg}
              alt={icon.iconName}
              width={25}
              height={25}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Socials;

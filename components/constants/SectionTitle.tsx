import React, { ReactElement } from "react";
import Image from "next/image";
import { Indie } from "@/app/fonts/font";

interface Props {
  title: string;
  image?: any;
  iconElement?: ReactElement;
  as?: "h1" | "h2";
}

const SectionTitle = ({ title, image, iconElement, as: Heading = "h2" }: Props) => {
  return (
    <div className="flex space-x-4 items-center">
      {image && (
        <Image
          src={image}
          height={100}
          width={100}
          className="h-8 w-8"
          alt=""
        />
      )}
      {iconElement && iconElement}
      <Heading className={`text-3xl font-semibold ${Indie.className}`}>{title}</Heading>
    </div>
  );
};

export default SectionTitle;

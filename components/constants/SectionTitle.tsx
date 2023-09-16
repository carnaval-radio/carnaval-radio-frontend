import React from "react";
import Image from "next/image";
import { Indie } from "@/app/fonts/font";
const SectionTitle = ({ title, icon }: { title: String; icon: any }) => {
  return (
    <div className="flex space-x-4 items-center">
      <Image src={icon} height={100} width={100} className="h-8 w-8" alt="" />
      <h2 className={`text-3xl font-semibold ${Indie.className}`}>{title}</h2>
    </div>
  );
};

export default SectionTitle;

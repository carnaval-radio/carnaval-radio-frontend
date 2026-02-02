"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { MdMenu } from "react-icons/md";
import SidebarLinks from "./Sidebar/SidebarLinks";
import Socials from "./Socials";
import SidebarPlayer from "./Sidebar/SidebarPlayer";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import MobileChromecast from "./MobileChromecast";
import TicketNudge from "./TicketNudge";
import { notificationData } from "@/data/notificationData";

interface props {
  themeData: any;
  menu: any;
}

const MobileHeader = ({ themeData, menu }: props) => {
  const sideBarRef = useRef<HTMLDivElement>(null);

  function toggleSidebar() {
    if (sideBarRef.current) {
      sideBarRef.current.classList.toggle("translate-y-[12%]");
    }
  }

  function closeSidebar() {
    if (sideBarRef.current) {
      sideBarRef.current.classList.remove("translate-y-[12%]");
    }
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-gradientStart to-gradientEnd md:hidden lg:hidden xl:hidden flex sm:flex justify-between p-2 pb-4 items-center sticky top-0 z-30">
        <Link href="/" onClick={closeSidebar}>
          <Image
            src={themeData.attributes.Logo.data.attributes.url}
            width={120}
            height={120}
            alt="Logo"
          />
        </Link>
        <div className="flex gap-4 items-center">
          {notificationData.nudgeEnabled && (
            <>
              <div style={{ width: 8 }} />
              <TicketNudge />
              <div style={{ width: 8 }} />
            </>
          )}
          <MobileChromecast />
          <Link className="rounded m-auto" href="verzoekjes">
            <FaWhatsapp className="text-emerald-500" size={40} />
          </Link>
          <button className="rounded" onClick={toggleSidebar}>
            <MdMenu size={50} />
          </button>
        </div>
      </div>
      <div
        ref={sideBarRef}
        className="w-ful absolute top-0 left-0 transform -translate-y-[120%] md:shadow-[0_35px_70px_-15px_rgba(0,0,0,0.1)]
       z-50 transition duration-500 ease-in-out flex flex-col child:transition-all  bg-white w-full pb-4"
      >
        <div className="flex flex-col p-4 bg-gradient-to-r from-gradientStart to-gradientEnd">
          <div className="flex items-center justify-between mt-4 mx-2">
            <p>Nu op de radio:</p>
            <Image src="/radio.png" height={20} width={20} alt="radio" />
          </div>
        </div>
        <SidebarPlayer />
        <div className="mt-8 bg-white">
          <SidebarLinks menu={menu} toggleSidebar={toggleSidebar} />
        </div>
        <Socials options="sidebar" />
      </div>
    </div>
  );
};

export default MobileHeader;

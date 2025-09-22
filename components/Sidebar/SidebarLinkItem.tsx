"use client";
import React, { useState } from "react";
import {
  MdHome,
  MdError,
  MdPhoneEnabled,
  MdApi,
  MdAssignmentInd,
  MdMusicNote,
  MdBusiness,
  MdKeyboardArrowDown,
  MdCreditCard,
  MdOutlineArticle,
  MdInsertComment,
  MdEvent,
} from "react-icons/md";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

const IconMapping: any = {
  "<MdHome />": <MdHome />,
  "<MdError />": <MdError />,
  "<MdPhoneEnabled />": <MdPhoneEnabled />,
  "<MdApi />": <MdApi />,
  "<MdAssignmentInd />": <MdAssignmentInd />,
  "<MdMusicNote />": <MdMusicNote />,
  "<MdBusiness />": <MdBusiness />,
  "<MdCreditCard />": <MdCreditCard />,
  "<MdOutlineArticle />": <MdOutlineArticle />,
  "<MdInsertComment />": <MdInsertComment />,
  "<MdEvent />": <MdEvent />,
};

interface props {
  item: any;
  index: any;
  toggleSidebar: any;
}

const SidebarLinkItem = ({ item, index, toggleSidebar }: props) => {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const formatPath = (p: string) => {
    if (!p) return "";
    const segments = p.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : "";
  };

  if (!item?.items || item?.items?.length === 0) {
    return (
      <Link href={item.path} key={"sideBarLink" + index} legacyBehavior>
        <a target={item.path?.includes('https://') ? "_blank" : undefined}
          onClick={() => {
            toggleSidebar && toggleSidebar();
          }}
          className="relative"
        >
          {path == item.path && (
            <Image
              className="h-10 w-2 absolute left-0 top-0 bottom-0 "
              src="/sideCone.png"
              height={100}
              width={20}
              alt=""
            />
          )}
          <div
            className={`flex items-center justify-start p-4 sm:px-4 md:p-2 lg:p-2 xl:p-2 2xl:p-[10px] ml-7 mr-2 rounded-xl hover:bg-menuHover ${
              path == item.path && "bg-primaryShade_2"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl text-secondary ${
                    path == item.path && "!text-primary"
                  } `}
                >
                  {item.Icon && IconMapping[item.Icon]}
                </span>
                <p
                  className={`text-[16px] text-menuText hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-secondary ${
                    path == item.path &&
                    "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                  }`}
                >
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  } else {
    return (
      <div
        onClick={() => {
          setOpen(!open);
        }}
        key={"sideBarLink" + index}
        className="relative cursor-pointer"
      >
        {path == item.path && (
          <Image
            className="h-10 w-2 absolute left-0 top-0 bottom-0 "
            src="/sideCone.png"
            height={100}
            width={20}
            alt=""
          />
        )}
        <div
          className={`flex items-center justify-start p-4 sm:px-4 md:p-2 lg:p-2 xl:p-2 2xl:p-[10px] ml-7 mr-2 rounded-xl hover:bg-menuHover ${
            path == item.path && "bg-primaryShade_2"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl text-secondary ${path == item.path && "!text-primary"} `}
              >
                {item.Icon && IconMapping[item.Icon]}
              </span>
              <p
                className={`text-[16px] text-menuText hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-secondary ${
                  path == item.path &&
                  "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                }`}
              >
                {item.title}
              </p>
            </div>
            <span
              className={`text-2xl text-[#FF9D00] ${
                open ? "rotate-180 duration-150" : "rotate-0 duration-150"
              }`}
            >
              <MdKeyboardArrowDown />
            </span>
          </div>
        </div>

        <div
          className={` ${
            open
              ? "flex flex-col bg-gray-50 rounded-md ml-8 mr-2 pl-8 pt-2 overflow-hidden"
              : "hidden"
          }`}
        >
          {item.items.map((item: any, index: any) => (
            <Link
              href={`/${formatPath(item.path)}`}
              onClick={() => {
                toggleSidebar && toggleSidebar();
              }}
              key={"sideBarLink-Sub" + index}
              className="p-2 hover:bg-menuHover text-menuText"
              replace
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }
};

export default SidebarLinkItem;

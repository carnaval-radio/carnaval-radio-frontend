import Image from "next/image";
import SidebarLinks from "./SidebarLinks";
import Socials from "../Socials";
import SidebarPlayer from "./SidebarPlayer";
import Link from "next/link";
import { AuthButtonWithSuspense } from "../AuthButtonSuspense";
import { optimizeLogoImage } from "@/src/types/cloudinaryOptimization";

interface props {
  menu: any;
  themeData: any;
}

const SideBar = ({ menu, themeData }: props) => {
  let logoUrl = themeData.attributes.Logo.data.attributes.url;

  if(process.env.THEME === "oktoberfest") {
    logoUrl = undefined; // Set later
  }

  if(!logoUrl) { 
    logoUrl = "https://res.cloudinary.com/dwzn0q9wj/image/upload/f_auto,q_auto:eco/v1698585479/carnavalradiologo.png";
  }

  return (
    <div className="sidebar-navigation max-h-screen md:sticky md:top-0 z-50 h-full bg-white flex-col hidden sm:hidden md:flex lg:flex xl:flex sm:w-0 md:w-[100%] lg:w-[100%] xl:w-[100%] absolute left-0 md:shadow-[0_35px_70px_-15px_rgba(0,0,0,0.05)] md:max-h-screen md:min-h-screen overflow-y-auto">
      <div className="flex flex-col p-4 bg-gradient-to-r from-gradientStart to-gradientEnd">
        <div
          className="flex items-center
    justify-center"
        >
          <Link href="/" className="flex items-center justify-center">
            <Image
              src={optimizeLogoImage(logoUrl, 200)}
              width={200}
              height={200}
              alt="Logo"
              loading="lazy"
            />
          </Link>
        </div>
        <div className="flex items-center justify-between mt-4 mx-2">
          <p>Nu op de radio</p>
          <Image src="/radio.png" height={20} width={20} alt="" />
        </div>
      </div>
      <SidebarPlayer />
      <div className="mt-4">
        <SidebarLinks menu={menu} />
      </div>
      <Socials options="sidebar" />
      <div className="mt-6 px-4 pb-4 border-t pt-4">
        <AuthButtonWithSuspense />
      </div>
    </div>
  );
};

export default SideBar;

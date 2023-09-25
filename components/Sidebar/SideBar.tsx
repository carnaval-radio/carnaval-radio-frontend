"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import SidebarLinks from "./SidebarLinks";
import Socials from "../Socials";
import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_THEME_DATA } from "@/GlobalState/ApiCalls/graphql/theme_queries";
import { useDispatch } from "react-redux";
import { getThemeData } from "@/GlobalState/features/themeSlice";
import { GET_UI_NAVIGATION } from "@/GlobalState/ApiCalls/graphql/navigation_queries";
import SidebarPlayer from "./SidebarPlayer";

const SideBar = () => {
  const dispatch = useDispatch();
  const [themeData, setThemeData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>();
  const [menu, setMenu] = useState<any>();

  const fetchTheme = async () => {
    const {
      loading,
      error,
      data: themeDataStrapi,
    } = await client.query({
      query: GET_THEME_DATA,
    });
    setThemeData(themeDataStrapi.theme.data);
    setLoading(loading);
    setError(error);
    dispatch(getThemeData(themeDataStrapi.theme.data));
  };

  const fetchMenu = async () => {
    const { data } = await client.query({
      query: GET_UI_NAVIGATION,
      variables: { menuName: "main" },
    });
    setMenu(data.renderNavigation);
  };

  useEffect(() => {
    fetchTheme();
    fetchMenu();
  }, [error]);

  return (
    <div className=" max-h-screen md:sticky md:top-0 z-50 h-full bg-white flex-col hidden sm:hidden md:flex lg:flex xl:flex sm:w-0 md:w-[100%] lg:w-[100%] xl:w-[100%] absolute left-0 md:shadow-[0_35px_70px_-15px_rgba(0,0,0,0.05)] md:max-h-screen md:min-h-screen">
      <div className="flex flex-col p-4 bg-gradient-to-r from-[#FFF8F9] to-[#F8FFF9]">
        <div
          className="flex items-center
    justify-center"
        >
          {!loading && themeData?.attributes?.Logo?.data?.attributes?.url ? (
            <div className="flex items-center justify-center">
              <Image
                src={themeData.attributes.Logo.data.attributes.url}
                width={200}
                height={200}
                alt="Logo"
              />
            </div>
          ) : (
            <span className="flex items-center justify-center h-[100px] sm:h-[150px] md:h-[150px] lg:h-[120px] w-[150px] sm:w-[330px] md:w-[200px] lg:w-[200px] ml-2 bg-gray-300 animate-pulse rounded-lg">
              Aan het laden
            </span>
          )}
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
    </div>
  );
};

export default SideBar;

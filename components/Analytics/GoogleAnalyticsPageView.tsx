"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/helpers/gtagHelper";

const GoogleAnalyticsPageView = ({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams ? searchParams.toString() : "");

    pageview(GA_MEASUREMENT_ID, url);
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  return null;
};

export default GoogleAnalyticsPageView;

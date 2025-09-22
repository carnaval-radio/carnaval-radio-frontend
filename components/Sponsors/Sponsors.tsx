import React, { Suspense } from "react";
import SectionTitle from "../constants/SectionTitle";
import SponsorCard from "./SponsorCard";
import sponsors_icon from "../../public/sponsors.png";
import SponsorsSkeleton from "../LoadingSkeleten/SponsorsSkeleton";
import { fetchSponsors } from "@/GlobalState/ApiCalls/fetchSponsors";

const Sponsors = () => {
  return (
    <div className="text-black px-10 py-2 bg-gradient-to-r from-gradientStart to-gradientEnd">
      <SectionTitle title="sponsoren" image={sponsors_icon} />
      <Suspense fallback={<SponsorsSkeleton />}>
        <SponsorsLoaded />
      </Suspense>
    </div>
  );
};

const SponsorsLoaded = async () => {
  const sponsors = await fetchSponsors();
  return <SponsorCard sponsors={sponsors} />
}

export default Sponsors;

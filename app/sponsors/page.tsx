"use client";
import { client } from "@/GlobalState/ApiCalls/api.config";
import Image from "next/image";
import React, { useEffect, Fragment, useState } from "react";
import { GET_ALL_SPONSORS } from "@/GlobalState/ApiCalls/graphql/sponsor_queries";
import {
  Sponsor,
  SponsorType,
  GraphQLSponsor,
  GraphQLSponsorType,
} from "../../types/sponsorTypes";
import SectionTitle from "@/components/constants/SectionTitle";
import sponsors_icon from "../../public/sponsors.png";

const logoSizeMapping: {
  [id: string]: string;
} = {
  S: "w-16",
  M: "w-24",
  L: "w-32",
  XL: "w-40",
  XXL: "w-48",
};

const page = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>();
  const [sponsorTypes, setSponsorsTypes] = useState<SponsorType[]>();

  const LogosPerType = ({
    sponsor,
    logoSize,
  }: {
    sponsor: any;
    logoSize: string;
  }) => {
    const logoClassName = `${logoSizeMapping[logoSize]}`;

    return (
      <div className="flex flex-wrap gap-4 mt-5">
        {sponsor.map((x: any) => {
          return (
            <a
              href={x.Link}
              target="_blank"
              key={x.Name}
              className="p-8 bg-white rounded-xl"
            >
              {x.Logo ? (
                <Image
                  key={x.Name}
                  className={logoClassName}
                  src={x.Logo.Url}
                  width={x.Logo.Width}
                  height={x.Logo.Height}
                  alt={`Logo van ${x.Name}`}
                />
              ) : (
                <div className="p-2 rounded border border-primary">
                  {x.Name}
                </div>
              )}
            </a>
          );
        })}
      </div>
    );
  };

  const fetchSponsors = async () => {
    const { data } = await client.query({ query: GET_ALL_SPONSORS });

    const sponsors: Sponsor[] = data.sponsors.data.map((x: GraphQLSponsor) => {
      return {
        Name: x.attributes.Name,
        Link: x.attributes.Link,
        Logo: x.attributes.Logo.data
          ? {
              Width: x.attributes.Logo.data.attributes.width,
              Height: x.attributes.Logo.data.attributes.height,
              Url: x.attributes.Logo.data.attributes.url,
            }
          : null,
        TypeID: x.attributes.Type.data.id,
      } as Sponsor;
    });

    setSponsors(sponsors);

    const sponsorTypes: SponsorType[] = data.sponsorTypes.data.map(
      (x: GraphQLSponsorType) => {
        return {
          Id: x.id,
          Name: x.attributes.Name,
          Order: x.attributes.Order,
          LogoSize: x.attributes.LogoSize,
        } as SponsorType;
      }
    );

    setSponsorsTypes(sponsorTypes);
  };

  useEffect(() => {
    document.title = "Sponsoren | 24/7 Vasteloavend Muzieek";
    fetchSponsors();
  }, []);
  return (
    <div className="p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <SectionTitle title="sponsoren" icon={sponsors_icon} />
      </div>
      {sponsorTypes?.map((st) => {
        const sponsorsPerType = sponsors?.filter((x) => x.TypeID === st.Id);
        return (
          <div key={st.Name} className="mt-12">
            <span className="p-2 bg-white rounded">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary bg-white rounded inline">
                {st.Name}
              </h2>
            </span>
            <LogosPerType sponsor={sponsorsPerType} logoSize={st.LogoSize} />
          </div>
        );
      })}
    </div>
  );
};

export default page;
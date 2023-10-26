import { client } from "@/GlobalState/ApiCalls/api.config";
import Image from "next/image";
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
  S: "w-16 h-8",
  M: "w-28 h-16",
  L: "w-32 h-18",
  XL: "w-40 h-20",
  XXL: "w-48 h-32",
};

export async function generateMetadata() {
  return {
    title: `Sponsoren | 24/7 Vasteloavend Muzieek`,
  };
}

const page = async () => {
  const { data } = await client.query({
    query: GET_ALL_SPONSORS,
  });

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

  const LogosPerType = ({
    sponsor,
    logoSize,
  }: {
    sponsor: Sponsor[];
    logoSize: string;
  }) => {
    const logoClassName = `${logoSizeMapping[logoSize]}`;

    return (
      <div className="flex flex-wrap gap-4 mt-5">
        {sponsor.map((x: Sponsor) => {
          return (
            <a
              href={x.Link}
              target="_blank"
              key={"SponsorOnSponsorPage" + x.Id}
              className={`${
                x.Logo ? "p-6" : "p-4"
              } flex items-center h- justify-center bg-white rounded-xl`}
            >
              {x.Logo ? (
                <Image
                  key={x.Name}
                  className={logoClassName}
                  src={x.Logo.Url}
                  width={200}
                  height={150}
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

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <SectionTitle title="Sponsoren" image={sponsors_icon} />
      </div>
      {sponsorTypes?.map((st) => {
        const sponsorsPerType = sponsors?.filter((x) => x.TypeID === st.Id);
        return (
          <div key={"SponsorePerType" + st.Id} className="mt-12">
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

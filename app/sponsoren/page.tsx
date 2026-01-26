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
import { MdAdd } from "react-icons/md";
import Link from "next/link";

const logoSizeMapping: {
  [id: string]: string;
} = {
  S: "h-8",
  M: "h-16",
  L: "h-20",
  XL: "h-24",
  XXL: "h-32",
};

export async function generateMetadata() {
  return {
    title: `Sponsoren | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    alternates: {
      canonical: "/sponsoren",
    },
  };
}

const page = async () => {
  const { data } = await client.query({
    query: GET_ALL_SPONSORS,
    context: {
      fetchOptions: {
        next: { tags: ["sponsors"] },
      },
    },
  });

  const sponsors: Sponsor[] = data.sponsors.data.map((x: GraphQLSponsor) => {
    return {
      Id: x.id,
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
      Order: x.attributes.DisplayPriority ?? Number.MAX_SAFE_INTEGER,
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
    },
  );

  const LogosPerType = ({
    sponsor,
    logoSize,
  }: {
    sponsor: Sponsor[];
    logoSize: string;
  }) => {
    const logoClassName = `${logoSizeMapping[logoSize]}`;
    const sortedSponsors = sponsor.sort((a, b) => a.Order - b.Order);

    return (
      <div className="flex flex-wrap gap-4 mt-5">
        {sortedSponsors.map((x: Sponsor) => {
          return (
            <a
              href={x.Link}
              target="_blank"
              key={"SponsorOnSponsorPage" + x.Id}
              className={`${
                x.Logo ? "p-6" : "p-4 h-"
              } flex items-center w-fit justify-center bg-white rounded-xl`}
            >
              {x.Logo ? (
                <Image
                  key={x.Name}
                  className={`${logoClassName} object-contain w-full max-w-48`}
                  src={x.Logo.Url}
                  width={200}
                  height={200}
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
        <Link
          href="sponsorprogramma-radio-reclame"
          className="flex items-center border-4 border-dotted border-gray-300 bg-transparent bg-opacity-50 w-fit justify-center cursor-pointer text-gray-300  rounded-xl hover:border-gray-600 hover:text-gray-600"
        >
          <MdAdd
            size={40}
            className={`${logoClassName} object-contain w-full max-w-48 p-2 min-w-16`}
          />
        </Link>
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

import TeamMemberComponent from "@/components/Team/TeamMember";
import { TeamMember } from "@/types/teamTypes";
import { GET_TEAM_DATA } from "@/GlobalState/ApiCalls/graphql/team_queries";
import { client } from "@/GlobalState/ApiCalls/api.config";
import LinkSelect from "@/components/constants/LinkSelect";
import { pageMetadata } from "@/helpers/seo";

export async function generateMetadata() {
  return pageMetadata(
    "Ons vrijwilligersteam | Carnaval Radio",
    "Ontmoet de vrijwilligers achter Carnaval Radio uit Brunssum. Ons team zet zich in voor de Limburgse Vastelaovend en carnavalsmuziek, het hele jaar door.",
    "/team/standaard",
  );
}
const sortOptions = ["standaard", "toetredingsdatum", "naam"];

export async function generateStaticParams() {
  return sortOptions.map((sortorder) => ({
    sortorder: sortorder,
  }));
}

const page = async ({ params }: { params: { sortorder: string } }) => {
  const { data } = await client.query({
    query: GET_TEAM_DATA,
    context: {
      fetchOptions: {
        next: { tags: ["team"] },
      },
    },
  });

  let teamMembers: TeamMember[] | undefined = data?.team?.data;

  if (!teamMembers) {
    return null;
  }

  if (params.sortorder === "standaard") {
    teamMembers = teamMembers.slice().sort(() => Math.random() - 0.5);
  }
  if (params.sortorder === "naam") {
    teamMembers = teamMembers
      .slice()
      .sort((a, b) => a.attributes.Name.localeCompare(b.attributes.Name));
  }

  return (
    <>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Ons team
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-400">
              Ontmoet de mensen achter Carnaval Radio. We zijn een team van
              vrijwilligers die zich inzetten voor de vastelaovend.
            </p>
          </div>
          <div className="mt-16">
            <p className="text-lg text-gray-400">
              Sorteer op:
            </p>
          <LinkSelect
            options={[
              {
                label: "Willekeurig",
                value: "standaard",
              },
              { label: "Naam", value: "naam" },
              { label: "Toetredingsdatum", value: "toetredingsdatum" },
            ]}
          />
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8"
          >
            {teamMembers.map((item, i) => (
              <TeamMemberComponent
                key={item.attributes.Name}
                data={item}
                index={i}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default page;

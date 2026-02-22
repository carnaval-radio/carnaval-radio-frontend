import { SponsorType, Sponsor, GraphQLSponsor, GraphQLSponsorType } from "@/types/sponsorTypes";
import { client } from "./api.config";
import { GET_ALL_SPONSORS } from "./graphql/sponsor_queries";

export const fetchSponsors = async () => {
    const { data: sponsorData } = await client.query({
        query: GET_ALL_SPONSORS,
        context: {
            fetchOptions: {
                next: { revalidate: 3600, tags: ["sponsors"] }, // Cache for 1 hour
            },
        },
    });

    const sponsorTypes: SponsorType[] = sponsorData.sponsorTypes.data.map((x: GraphQLSponsorType) => {
        return {
            Id: x.id,
            Name: x.attributes.Name,
            ShowOnHomePage: x.attributes.ShowOnHomePage,
            Order: x.attributes.Order,
            LogoSize: x.attributes.LogoSize,
        };
    });

    let sponsorsAll: Sponsor[] = [];
    sponsorData.sponsors.data.map((x: GraphQLSponsor) => {
        sponsorTypes.map((st) => {
            if (st.Id == x.attributes.Type.data.id) {
                const sponsorSingle: Sponsor = {
                    Id: x.id,
                    Name: x.attributes.Name,
                    Link: x.attributes.Link,
                    Logo: x.attributes.Logo?.data
                        ? {
                            Width: x.attributes.Logo.data.attributes.width,
                            Height: x.attributes.Logo.data.attributes.height,
                            Url: x.attributes.Logo.data.attributes.url,
                        }
                        : undefined,
                    TypeID: x.attributes.Type.data.id,
                    ShowOnHomePage: st.ShowOnHomePage,
                    Order: (st.Order * 10000) + (x.attributes.DisplayPriority ?? 1000),
                };
                sponsorsAll = [...sponsorsAll, sponsorSingle];
            }
        });
    });
    return sponsorsAll;
};

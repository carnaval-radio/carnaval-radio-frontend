import { client } from "./api.config";
import { GET_ALL_EVENTS } from "./graphql/events_queries";

export interface Event  {
    id: string;
    Title: string;
    Date: string;
    Address: string;
    Link: string;
    IsHighlighted: boolean;    
}

export const fetchEvents = async () => {
    const { data } = await client.query({ 
        query: GET_ALL_EVENTS, 
        context: { 
            fetchOptions: { 
                next: { revalidate: 3600, tags: ["events"] }, // Cache for 1 hour
            }, 
        }, 
    });

    const events: Event[] = data.events.data.map((x: any) => {
        return {
            id: x.id,
            Title: x.attributes.Title,
            Date: x.attributes.Date,
            Address: x.attributes.Address,
            Link: x.attributes.Link,
            IsHighlighted: x.attributes.IsHighlighted,
        };
    });    
    return events;
}
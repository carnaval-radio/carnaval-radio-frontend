
import { Indie } from "../../fonts/font";
import { Metadata } from "next";
import RequestForm from "@/components/Requests/RequestForm";

export const metadata: Metadata = {
  title: "Verzoekjes | Carnaval Radio | 24/7 Vasteloavend Muzieek",
  description:
    "Doe nu je eigen verzoekje! De vastelaoves Radio | 24/7 Vastelaovend Muzieek",
      alternates: {
    canonical: '/verzoekjes',
  },
};

const RequestsPage: React.FC = () => {
  return (
    <>
      <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
        <div className="p-8 rounded-3xl bg-white max-w-3xl">
          <h2
            className={`text-3xl text-primary mb-2 font-bold ${Indie.className}`}
          >
            Verzoekjes
          </h2>
          <RequestForm />
        </div>
      </div>
      
    </>
  );
};

export default RequestsPage;

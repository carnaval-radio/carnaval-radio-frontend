import Script from "next/script";
import { Indie } from "../fonts/font";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verzoekjes | Carnaval Radio | 24/7 Vasteloavend Muzieek",
  description:
    "Doe nu je eigen verzoekje! De vastelaoves Radio | 24/7 Vastelaovend Muzieek",
  alternates: {
    canonical: "/requests",
  },
};

const RequestsPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const token = searchParams?.["token"] ?? "";
  const validToken = process.env.VALID_TOKEN;

  if (token !== validToken) {
    return (
      <>
        <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
          <div className="p-8 rounded-3xl bg-white max-w-3xl">
            <h2
              className={`text-3xl text-primary mb-5 font-bold ${Indie.className}`}
            >
              Verzoekjes
            </h2>
            <p className="text-lg text-gray-700 mb-5">
              Je hebt geen toegang tot deze pagina.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
        <div className="p-8 rounded-3xl bg-white max-w-3xl">
          <h2
            className={`text-3xl text-primary mb-5 font-bold ${Indie.className}`}
          >
            Verzoekjes
          </h2>

          <Script
            src="https://ams1.reliastream.com/system/request.js"
            strategy="afterInteractive"
          />
          <form
            className="cc_request_form bg-white rounded px-8 pt-6 pb-8 mb-4"
            data-username="scarna00"
          >
            <div data-type="result" className="rounded-lg p-2"></div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-l font-bold mb-2"
                htmlFor="artist"
              >
                Artiest
              </label>
              <input
                className="w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="artist"
                type="text"
                name="request[artist]"
                maxLength={127}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-l font-bold mb-2"
                htmlFor="title"
              >
                Titel
              </label>
              <input
                className="w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                name="request[title]"
                maxLength={127}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-l font-bold mb-2"
                htmlFor="dedication"
              >
                Voor wie of waarom wil je dit nummer aanvragen?
              </label>
              <input
                className="w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="dedication"
                defaultValue={"Voor ons gewoon, tuup!"}
                type="text"
                name="request[dedication]"
                maxLength={127}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-l font-bold mb-2"
                htmlFor="sender"
              >
                Jouw naam
              </label>
              <input
                className="w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="sender"
                type="text"
                defaultValue={"Zo ene die de plaatjes draaie doet"}
                name="request[sender]"
                maxLength={127}
              />
            </div>
            <input
              className="hidden"
              readOnly
              type="text"
              name="request[email]"
              value="muziek@carnaval-radio.nl"
            />
            <div className="flex items-center justify-between py-2">
              <input
                className="w-full input rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline cursor-pointer"
                type="button"
                value="Verstuur aanvraag"
                data-type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RequestsPage;

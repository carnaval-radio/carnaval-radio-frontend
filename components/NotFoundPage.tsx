import { Indie } from "@/app/fonts/font";
import Link from "next/link";
import Sponsors from "@/components/Sponsors/Sponsors";

const NotFoundPage = () => {
  return (
    <>
      <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
        <div className="p-8 rounded-3xl bg-white max-w-3xl">
          <h2
            className={`text-3xl text-primary mb-5 font-bold ${Indie.className}`}
          >
            404 - Niet gevonden
          </h2>
          <div className="mb-4">
            <p className="mb-8">Deze pagina bestaat niet meer.</p>
            <Link
              href="/"
              className="bg-gradient-to-r text-center from-primary to-secondary rounded-lg mt-8 py-3 px-4 text-white font-semibold"
            >
              Ga naar de homepagina
            </Link>
          </div>
        </div>
      </div>
      <Sponsors />
    </>
  );
};

export default NotFoundPage;

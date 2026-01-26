import RecentSongsPage from "@/components/RecentSongs/RecentSongsPage";

export const fetchCache = "force-no-store";

export const metadata = {
  title:
    "Recente Nummers | Carnaval Radio Brunssum - Laatste Vastelaovend Hits",
  description:
    "Luister naar de meest recente carnavalsmuziek en Limburgse Vastelaovend hits op Carnaval Radio. Ontdek de nieuwste polonaise en LVK nummers die de feestvloer opwarmen.",
  keywords:
    "recente nummers, carnavalsmuziek, Limburgse hits, Vastelaovend hits, polonaise, LVK nummers",
  alternates: {
    canonical: "/recente-nummers",
  },
};

const page = () => { 
  return (
      <RecentSongsPage />
  );
}

export default page;

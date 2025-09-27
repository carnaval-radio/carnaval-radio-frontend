import FavoritesClient from "./FavoritesClient";
import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../fonts/font";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorieten | Carnaval Radio Brunssum - Jouw Vastelaovend Hits",
  description: "Bekijk jouw favoriete carnavalsmuziek en Limburgse Vastelaovend hits op Carnaval Radio. Beheer je persoonlijke playlist met de beste polonaise en LVK nummers.",
  keywords: "favorieten, carnavalsmuziek, Limburgse hits, Vastelaovend playlist, polonaise favorieten, LVK hits",
};

export default function FavoritesPage() {
	return (
		<div className="p-4">
			<div className="flex items-center gap-2 mb-4">
				<BsFileMusicFill className="text-2xl text-secondary" />
				<h1 className={`text-2xl font-semibold ${Indie.className}`}>Favorieten</h1>
			</div>
			<FavoritesClient />
		</div>
	);
}
import FavoritesClient from "./FavoritesClient";
import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../fonts/font";

export default function FavoritesPage() {
	return (
		<div className="p-4">
			<div className="flex items-center gap-2 mb-4">
				<BsFileMusicFill className="text-2xl text-secondary" />
				<h2 className={`text-2xl font-semibold ${Indie.className}`}>Favorieten</h2>
			</div>
			<FavoritesClient />
		</div>
	);
}
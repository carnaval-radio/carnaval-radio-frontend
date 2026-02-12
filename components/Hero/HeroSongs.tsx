"use client";
import React, { useEffect, useState } from "react";
import { BsFileMusicFill } from "react-icons/bs";
import Link from "next/link";
import { Indie } from "@/app/fonts/font";
import RecentSongs from "../RecentSongs/RecentSongs";
import { RecentSong, fetchSongs } from "@/GlobalState/ApiCalls/fetchSongs";

const HeroSongs = () => {
	const [recentTracks, setRecentTracks] = useState<RecentSong[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Boolean>(false);
	const [canAddToFavorites, setCanAddToFavorites] = useState<boolean>(false);

	const fetchTracks = async () => {
		try {
			// Fetch only the 4 most recent songs for the hero section
			setLoading(true);
			// Fetch from API route
			const res = await fetch('/api/songs?limit=4', { cache: 'no-store' });
			if (!res.ok) {
				// dont render component on error
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			const data = await res.json();
			setRecentTracks(data.songs || []);
			setCanAddToFavorites(!!data.canAddToFavorites);
			// Direct fetch (bypass API route)
			// const data = await fetchSongs();
			// setRecentTracks(data.slice(0, 4));
			setLoading(false);
		} catch (error) {
			setError(true);
		}
	};

	useEffect(() => {
		fetchTracks();
		const interval = setInterval(fetchTracks, 30000);
		return () => clearInterval(interval);
	}, [error]);

	return (
		<div className="flex flex-col py-8 px-2 sm:px-4 md:px-8 lg:px-8 xl:px-8 rounded-xl min-w-[30vw] shadow-lg md:ml-5 bg-gradient-to-br from-gradientStart to-gradientEnd">
			<div className="flex items-center justify-center gap-2 mb-4">
				<BsFileMusicFill className="text-2xl text-secondary" />
				<h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
					Gedraaide nummers
				</h2>
			</div>
			{error ? <p>Helaas ondervinden wij problemen met het ophalen van de gedraaide nummers. Je kunt wel luisteren.</p>
				: (
					<>
						<RecentSongs loading={loading} recentTracks={recentTracks} maxTracks={4} canAddToFavorites={canAddToFavorites} denseDate={true} />
						<Link
							href="/gedraaide-nummers"
							className="bg-gradient-to-r text-center from-primary to-secondary rounded-lg mt-8 py-3 px-4 text-white font-semibold"
						>
							Meer gedraaide nummers
						</Link>
					</>)}
		</div>
	);
};

export default HeroSongs;

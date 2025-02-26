"use client";

import dynamic from 'next/dynamic';
import { YouTubeProps } from 'react-youtube';

const YouTube = dynamic(() => import('react-youtube') as unknown as Promise<React.ComponentType<YouTubeProps>>, { ssr: false });

const HeroYoutubeMovie = () => {
    const opts: YouTubeProps['opts'] = {
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: 0,
        },
    };

    return (
        <div className="h-full w-full flex justify-center items-center group
            rounded-xl min-w-[35vw] shadow-lg md:ml-5 bg-black">

            <div className="relative w-full h-full">
                <YouTube
                    videoId="81-IQsNImXU"
                    opts={opts}
                    className="absolute py-4 top-0 left-0 w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default HeroYoutubeMovie;
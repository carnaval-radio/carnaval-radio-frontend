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
        <div className="flex flex-col py-3 items-center justify-center
            rounded-xl min-w-[35vw] shadow-lg md:ml-5 bg-black md:flex">
            
            <div className="relative w-full aspect-[16/9]">
                <YouTube videoId="81-IQsNImXU" opts={opts} className="w-full h-full object-cover" />
            </div>
        </div>
    );
};

export default HeroYoutubeMovie;
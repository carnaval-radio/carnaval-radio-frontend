"use client";

const HeroYoutubeMovie = () => {
    return (
        <div className="h-full w-full flex justify-center items-center group
            rounded-xl min-w-[35vw] shadow-lg md:ml-5 bg-black">

            <div className="relative w-full h-full">

                <iframe className="absolute top-0 left-0 w-full h-full py-3" src="https://www.youtube.com/embed/81-IQsNImXU?si=XPwgI3fm_8qHyHzp" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
                    
                </iframe>

            </div>
        </div>
    );
};

export default HeroYoutubeMovie;

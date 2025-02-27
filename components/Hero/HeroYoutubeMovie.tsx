"use client";

const HeroYoutubeMovie = () => {
    return (
        <div className="h-full w-full justify-center items-center group
            rounded-xl min-w-[35vw] shadow-lg bg-black">

            <div className="relative w-full h-full">

                <iframe className="w-full h-full py-3" src="https://www.youtube.com/embed/81-IQsNImXU?si=XPwgI3fm_8qHyHzp&vq=hd720" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
                    
                </iframe>

            </div>
        </div>
    );
};

export default HeroYoutubeMovie;

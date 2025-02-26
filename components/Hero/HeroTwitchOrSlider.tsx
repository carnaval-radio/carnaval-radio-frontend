import { fetchTwitch } from "@/GlobalState/ApiCalls/fetchTwitch";
import HeroSlider from "./HeroSlider";
import HeroTwitch from "./HeroTwitch";
import { Slide } from "@/types/slideTypes";
import HeroYoutubeMovie from "./HeroYoutubeMovie";

const HeroTwitchOrSlider = async ({slides} : {slides:  Slide[]}) => {
    const showTwitch = await fetchTwitch();
    const showAfterMovie = process.env.SHOW_AFTER_MOVIE ? process.env.SHOW_AFTER_MOVIE === "true" : true;

    if (showTwitch){
        return <HeroTwitch />
    }

    if(showAfterMovie) {
        return <HeroYoutubeMovie />
    }

    return <HeroSlider slides={slides} />
}

export default HeroTwitchOrSlider;
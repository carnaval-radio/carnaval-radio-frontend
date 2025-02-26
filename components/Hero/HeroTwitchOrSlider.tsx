import { fetchTwitch } from "@/GlobalState/ApiCalls/fetchTwitch";
import HeroTwitch from "./HeroTwitch";
import { Slide } from "@/types/slideTypes";
import HeroToggleSwitch from "./HeroToggleSwitch";

const HeroTwitchOrSlider = async ({ slides }: { slides: Slide[] }) => {
  const showTwitch = await fetchTwitch();
  const showAfterMovie =
    process.env.SHOW_AFTER_MOVIE ? process.env.SHOW_AFTER_MOVIE === "true" : true;

  if (showTwitch) {
    return <HeroTwitch />;
  }

  return (
    <div className="relative">
      {/* Display the HeroSlider or HeroYoutubeMovie with toggle */}
      <HeroToggleSwitch slides={slides} showAfterMovie={showAfterMovie} />
    </div>
  );
};

export default HeroTwitchOrSlider;

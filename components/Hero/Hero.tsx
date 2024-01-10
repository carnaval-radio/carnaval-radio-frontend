import HeroSlider from "./HeroSlider";
import HeroSongs from "./HeroSongs";
// import HeroTwitchOrSlider from "./HeroTwitchOrSlider";

const Hero = () => {
  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2  py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-[#f9f9f9]">
      {/* <HeroTwitchOrSlider /> */}
      <HeroSlider />
      <HeroSongs />
    </section>
  );
};

export default Hero;





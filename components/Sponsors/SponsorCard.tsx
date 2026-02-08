"use client";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import Carousel from "react-multi-carousel";
import { Sponsor } from "../../types/sponsorTypes";
import { useEffect, useState } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import SponsorsSkeleton from "../LoadingSkeleten/SponsorsSkeleton";
import { optimizeLogoImage, getBlurPlaceholder } from "@/src/types/cloudinaryOptimization";

interface Props {
  sponsors?: Sponsor[];
}

export default function SponsorCard({ sponsors }: Props) {
  const [loaded, setLoaded] = useState(false);
  const sponsorFiltered = sponsors?.filter((x) => x.ShowOnHomePage);
  const sponsorSorted = sponsorFiltered?.sort((a, b) => a.Order - b.Order);
  
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1250 },
      items: 4,
      slidesToSlide: 2,
    },
    desktop: {
      breakpoint: { max: 1250, min: 1024 },
      items: 3,
    },
    laptop: { breakpoint: { max: 1024, min: 800 }, items: 2 },
    tablet: {
      breakpoint: { max: 800, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  useEffect(() => { 
    setLoaded(true);
  }, []);

  return (
    !loaded ? <SponsorsSkeleton /> : <div className="md:max-w-[72vw]">
      <Carousel
        showDots={true}
        responsive={responsive}
        autoPlay={true}
        autoPlaySpeed={3000}
        shouldResetAutoplay={false}
        infinite={true}
        customLeftArrow={
          <ArrowFix>
            <div className="absolute top-[50%] -translate-x-0 translate-y-[-50%] left-0 text-2xl rounded-full p-2 text-white cursor-pointer bg-tertiary border-4 border-white opacity-70">
              <BsChevronCompactLeft size={25} />
            </div>
          </ArrowFix>
        }
        customRightArrow={
          <ArrowFix>
            <div className="absolute top-[50%] -translate-x-0 translate-y-[-50%] text-2xl rounded-full p-2 right-0 text-white cursor-pointer bg-tertiary border-4 border-white opacity-70">
              <BsChevronCompactRight size={25} />
            </div>
          </ArrowFix>
        }
      >
        {sponsorSorted &&
          sponsorSorted.map((x: any, i: any) => {
            return (
              x.Logo && (
                <div
                  key={"sponsorCarousel" + i}
                  className="mx-5 my-10 max-w-fit p-6 bg-white rounded-xl"
                >
                  <a href={x.Link || '#'} target="_blank" key={x.Name}>
                    <Image
                      className="h-24 object-contain max-w-full inline-block cursor-pointer rounded-lg"
                      src={optimizeLogoImage(x.Logo.Url, 300)}
                      width={300}
                      height={100}
                      alt={`Logo van ${x.Name}`}
                      loading="lazy"
                    />
                  </a>
                </div>
              )
            );
          })}
      </Carousel>
    </div>
  );
}

const ArrowFix = (arrowProps: any) => { 
  const {carouselState, rtl, fetchPriority, children, ...restArrowProps} = arrowProps; 
  return ( <span {...restArrowProps}> {children} </span> ); 
};
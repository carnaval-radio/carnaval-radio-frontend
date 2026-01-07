import React, { Fragment } from "react";
import { Post } from "../../types/articleTypes";
import PostDetails from "./PostDetails";
import news from "../../public/news.png";
import Link from "next/link";
import Section from "../Section";
interface props {
  posts?: Post[];
}

const PostCard = ({ posts }: props) => {
  function customSort(a: any, b: any) {
    const dateA: any = a.attributes.Date
      ? new Date(a.attributes.Date)
      : new Date(a.attributes.publishedAt);
    const dateB: any = b.attributes.Date
      ? new Date(b.attributes.Date)
      : new Date(b.attributes.publishedAt);

    // Compare the parsed dates
    return dateB - dateA;
  }

  const sortedPosts = posts && [...posts].sort(customSort);
  return (
    <Section title="Nieuws" icon={news}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 2xl:gap-10 mt-auto pt-2 sm:pt-2 md:pt-3 lg:pt-4 xl:pt-4 w-full">
        <>
          {sortedPosts &&
            sortedPosts.map((post: any, i: any) => (
              <Fragment key={"postFrag" + i}>
                {i < 6 && (
                  <PostDetails
                    key={"post" + i}
                    post={post}
                    colorIndex={i % 3}
                  />
                )}
              </Fragment>
            ))}
        </>
      </div>

      <div className="flex items-center justify-center pt-8">
        <Link
          href="/nieuwsberichten"
          className="bg-gradient-to-r from-primary to-secondary rounded-lg py-2 px-4 text-white font-semibold"
        >
          Meer nieuws
        </Link>
      </div>
    </Section>
  );
};

export default PostCard;

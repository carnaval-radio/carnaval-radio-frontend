import React, { Fragment } from "react";
import { Post } from "../../types/articleTypes";
import SectionTitle from "../constants/SectionTitle";
import PostDetails from "./PostDetails";
import news from "../../public/news.png";

import PostsSkeleten from "../LoadingSkeleten/PostsSkeleten";
import Link from "next/link";
interface props {
  posts?: Post[];
}

const PostCard = ({ posts }: props) => {
  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8">
      <div className="flex justify-between items-center">
        <SectionTitle title="Nieuws" icon={news} />
      </div>

      <div
        className="flex justify-start flex-wrap
       gap-3 md:gap-6 m-auto pt-2 sm:pt-2 md:pt-6 lg:pt-10 xl:pt-10 w-full"
      >
        <>
          {posts &&
            posts.map((post: any, i: any) => (
              <Fragment key={"postFrag" + i}>
                {i < 3 && <PostDetails key={"post" + i} post={post} i={i} />}
              </Fragment>
            ))}
        </>
      </div>

      <div className="flex items-center justify-center pt-8">
        <Link
          href="/articles"
          className="bg-gradient-to-r from-primary to-secondary rounded-lg py-2 px-4 text-white font-semibold"
        >
          Laad meer
        </Link>
      </div>
    </div>
  );
};

export default PostCard;

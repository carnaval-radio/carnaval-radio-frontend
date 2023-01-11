import React from "react";
import Link from "next/link";

import { Post } from "../typings";
import { MdKeyboardArrowRight } from "react-icons/md";

interface Props {
  posts: [Post];
}

const PostCard = ({ posts }: Props) => {
  return (
    <div className="px-10 space-y-10 md:space-y-0">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <div className="h-5 w-5 bg-[#FFA500]"></div>
          <h2 className="text-2xl">News</h2>
        </div>
        <button className="self-end flex items-center space-x-1 bg-[#FFA500] px-2 rounded-full">
          <p>See More</p> <MdKeyboardArrowRight />
        </button>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
       gap-3 md:gap-6 p-2 md:p-6 max-w-[1280px] m-auto"
      >
        {posts.map((post, i) => (
          <Link key={i} href={`/articles/${post.attributes.Slug}`}>
            <div className=" group cursor-pointer overflow-hidden bg-white">
              <img
                className="h-60 w-full object-cover"
                src={post.attributes.CoverImage.data.attributes.url}
                alt=""
              />
              <div className="flex justify-between pt-5 px-2 pb-2">
                <div>
                  <p className="text-lg font-bold">{post.attributes.Title}</p>
                  <p className="text-sm">
                    {post.attributes.Title} by {post.attributes.Title}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PostCard;

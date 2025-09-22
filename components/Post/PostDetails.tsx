import Link from "next/link";
import React from "react";
import { Post } from "@/types/articleTypes";
import ReactHtmlParser from "html-react-parser";
import { formatDate } from "@/helpers/formatDate";
import Video from "../Video";

const PostDetails = ({
  post,
  colorIndex,
}: {
  post: Post;
  colorIndex: number;
}) => {
  const sanitizeHtml = (html: any) => {
    const newHtml = html
      .replace(/<img[^>]*\/>|<iframe[^>]*>[\s\S]*?<\/iframe>/g, "")
      .replace(/<[^>]*>/g, "");
    const HtmlString =
      newHtml.substring(0, 200) + (newHtml.length > 200 ? "..." : "");
    return HtmlString;
  };

  if (post.title) {
    return (
      <div
        className={`${`bg-${
          colorIndex === 0
            ? "tertiaryShade_2"
            : colorIndex === 1
            ? "secondaryShade_2"
            : "primaryShade_3"
        }`}  rounded-xl p-5 overflow-hidden space-y-3`}
      >
        {/* <img
          className="h-60 w-[98%] object-cover rounded-xl"
          src={post?.attributes?.CoverImage?.data?.attributes?.url}
          alt=""
        /> */}
        <p className="text-sm text-gray-500">{formatDate(post.pubDate)}</p>
        <p className="text-2xl font-bold">{post.title}</p>
        {ReactHtmlParser(sanitizeHtml(post.description))}
        <Link
          href={`/nieuwsberichten/o/${post.title
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .replaceAll(" ", "-")}`}
          className={`flex items-center justify-center bg-white w-full border-2 ${
            colorIndex === 0
              ? "border-tertiary text-tertiary"
              : colorIndex === 1
              ? "border-secondary text-secondary"
              : "border-primary text-primary"
          } rounded-md p-2 text-sm font-semibold`}
        >
          Lees verder
        </Link>
      </div>
    );
  } else {
    return (
      <div
        className={`${`bg-${
          colorIndex === 0
            ? "tertiaryShade_2"
            : colorIndex === 1
            ? "secondaryShade_2"
            : "primaryShade_3"
        }`}  rounded-xl p-5 overflow-hidden space-y-3`}
      >
        {/* if no video */}
        {!post?.attributes?.CoverVideo?.data?.attributes?.url && (
          <img
            className="h-60 w-[98%] object-cover rounded-xl"
            src={post?.attributes?.CoverImage?.data?.attributes?.url}
            alt=""
          />
        )}
        {/* if video */}
        {post?.attributes?.CoverVideo?.data?.attributes?.url && (
          <div className="h-60 rounded-xl flex">
          <Video
            className="h-60 w-[98%] object-cover rounded-xl"
            src={post?.attributes?.CoverVideo?.data?.attributes?.url}
          /></div>
        )}
        <p className="text-sm text-gray-500">
          {post.attributes?.Date
            ? formatDate(post.attributes?.Date)
            : formatDate(post.attributes?.publishedAt)}
        </p>
        <p className="text-2xl font-bold">{post.attributes.Title}</p>
        {ReactHtmlParser(sanitizeHtml(post?.attributes?.Content))}
        <Link
          href={`/nieuwsberichten/${post.attributes.Slug}`}
          className={`flex items-center justify-center bg-white w-full border-2 ${
            colorIndex === 0
              ? "border-tertiary text-tertiary"
              : colorIndex === 1
              ? "border-secondary text-secondary"
              : "border-primary text-primary"
          } rounded-md p-2 text-sm font-semibold`}
        >
          Lees verder
        </Link>
      </div>
    );
  }
};

export default PostDetails;

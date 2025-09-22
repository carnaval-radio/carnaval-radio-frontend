import React from "react";
import ReactHtmlParser from "html-react-parser";
import Link from "next/link";
import { formatDate } from "@/helpers/formatDate";

interface props {
  item: any;
  i: any;
}

const LimburgPost = ({ item, i }: props) => {
  return (
    <div
      className={`${`bg-${
        i % 4 === 0
          ? "tertiaryShade_2"
          : i % 4 === 1
          ? "secondaryShade_2"
          : i % 4 === 2
          ? "primaryShade_3"
          : "secondaryShade_2"
      }`} rounded-xl p-5 overflow-hidden space-y-5 w-full`}
    >
      <h2 className="text-xl font-semibold">{item.title}</h2>
      <div className="container">{ReactHtmlParser(item.content)}</div>
      <p className="text-sm text-gray-500">{formatDate(item.isoDate)}</p>

      <Link
        target="_blank"
        className={`flex items-center justify-center bg-white border-2 rounded-md p-2 ${
          i % 4 === 0
            ? "border-tertiary text-tertiary"
            : i % 4 === 1
            ? "border-secondary text-secondary"
            : i % 4 === 2
            ? "border-primary text-primary"
            : "border-secondary text-secondary"
        }`}
        href={item.guid}
      >
        Verder lezen op Limburg24
      </Link>
    </div>
  );
};

export default LimburgPost;

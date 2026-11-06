import type { Metadata } from "next";
import { htmlToDOM, type DOMNode, type Element } from "html-react-parser";

export const SITE_URL = "https://www.carnaval-radio.nl";
export const SITE_TITLE = "Carnaval Radio | 24/7 Limburgse Vastelaovend Muziek";
export const SITE_DESCRIPTION =
  "Luister gratis naar Carnaval Radio: 24/7 Limburgse en Duitse carnavalsmuziek vanuit Brunssum. Met Vastelaovend- en LVK-hits, verzoekjes en live-uitzendingen.";

export function describeContent(html: string): string {
  function text(nodes: (DOMNode | Element["children"][number])[]): string {
    return nodes.map((node) => {
      if (node.type === "text") return node.data;
      if ("name" in node && ["script", "style"].includes(node.name)) return "";
      return "children" in node ? ` ${text(node.children)} ` : "";
    }).join("");
  }

  const content = text(htmlToDOM(html)).replace(/\s+/g, " ").trim();
  if (content.length <= 160) return content;
  const preview = content.slice(0, 157);
  const boundary = preview.lastIndexOf(" ");
  return `${preview.slice(0, boundary > 0 ? boundary : preview.length)}...`;
}

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Carnaval Radio",
      locale: "nl_NL",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

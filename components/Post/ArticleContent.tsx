import { createElement, Fragment, type ReactNode } from "react";
import {
  attributesToProps,
  domToReact,
  Element,
  htmlToDOM,
  Text,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import ArticleGallery, { type ArticleImage } from "./ArticleGallery";

function isSpacing(node: DOMNode): boolean {
  if (node instanceof Text) return !node.data.replace(/\u00a0/g, " ").trim();
  return node instanceof Element &&
    (node.name === "br" || (["p", "div"].includes(node.name) && node.children.every(child => isSpacing(child as DOMNode))));
}

function imageBlock(node: DOMNode): ArticleImage[] | null {
  if (!(node instanceof Element)) return null;
  if (node.name === "img") {
    return node.attribs.src ? [{ src: node.attribs.src, alt: node.attribs.alt || "" }] : null;
  }
  if (!["figure", "p", "div", "a", "span"].includes(node.name)) return null;

  const images: ArticleImage[] = [];
  let caption: ReactNode;
  for (const child of node.children) {
    const domChild = child as DOMNode;
    if (isSpacing(domChild)) continue;
    if (node.name === "figure" && domChild instanceof Element && domChild.name === "figcaption") {
      caption = domToReact(domChild.children as DOMNode[]);
      continue;
    }
    const nested = imageBlock(domChild);
    if (!nested) return null;
    images.push(...nested);
  }
  if (!images.length) return null;
  return images.map(image => ({
    ...image,
    ...(caption ? { caption } : {}),
    ...(node.name === "a" && node.attribs.href ? { href: node.attribs.href } : {}),
  }));
}

function renderNodes(nodes: DOMNode[], cover: { image?: ArticleImage }): ReactNode[] {
  const options: HTMLReactParserOptions = {
    replace(node) {
      if (node instanceof Element && node.children.some(child => imageBlock(child as DOMNode))) {
        const name = ["p", "span", "a"].includes(node.name) ? "div" : node.name;
        return createElement(name, attributesToProps(node.attribs), renderNodes(node.children as DOMNode[], cover));
      }
    },
  };
  const result: ReactNode[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const images = imageBlock(nodes[index]);
    if (!images) {
      result.push(<Fragment key={index}>{domToReact([nodes[index]], options)}</Fragment>);
      continue;
    }
    let lastImageIndex = index;
    for (let next = index + 1; next < nodes.length; next++) {
      if (isSpacing(nodes[next])) continue;
      const following = imageBlock(nodes[next]);
      if (!following) break;
      images.push(...following);
      lastImageIndex = next;
    }
    if (cover.image) {
      if (!images.some(image => image.src === cover.image?.src)) {
        images.unshift(cover.image);
      }
      cover.image = undefined;
    }
    result.push(<ArticleGallery key={index} images={images} />);
    index = lastImageIndex;
  }
  return result;
}

export default function ArticleContent({ html, coverImage }: { html: string; coverImage?: ArticleImage }) {
  const cover = { image: coverImage };
  const content = renderNodes(htmlToDOM(html), cover);
  return (
    <div className="cms-content article-content">
      {content}
      {cover.image && <ArticleGallery images={[cover.image]} />}
    </div>
  );
}

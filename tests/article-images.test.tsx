// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import ArticleContent from "@/components/Post/ArticleContent";
import ArticleGallery from "@/components/Post/ArticleGallery";

const dialogPrototype = HTMLDialogElement.prototype;
const originalShow = Object.getOwnPropertyDescriptor(dialogPrototype, "showModal");
const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, "close");

beforeAll(() => {
  Object.defineProperty(dialogPrototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) { this.open = true; },
  });
  Object.defineProperty(dialogPrototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) { this.open = false; },
  });
});

afterAll(() => {
  for (const [name, descriptor] of [["showModal", originalShow], ["close", originalClose]] as const) {
    if (descriptor) Object.defineProperty(dialogPrototype, name, descriptor);
    else Reflect.deleteProperty(dialogPrototype, name);
  }
});

describe("article image layout", () => {
  it("makes fixed-width iframe embeds responsive while preserving playback attributes", () => {
    const { container } = render(<ArticleContent html='<div style="width:900px"><iframe width="560" height="315" style="width:560px;height:315px" src="https://www.youtube.com/embed/example" title="Aftermovie" allow="autoplay; fullscreen" allowfullscreen></iframe></div>' />);
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", "https://www.youtube.com/embed/example");
    expect(frame).toHaveAttribute("title", "Aftermovie");
    expect(frame).toHaveAttribute("allow", "autoplay; fullscreen");
    expect(frame).toHaveAttribute("allowfullscreen");
    expect(frame).not.toHaveAttribute("width");
    expect(frame).not.toHaveAttribute("height");
    expect(frame).not.toHaveAttribute("style");
    expect(frame.parentElement).toHaveClass("article-embed");
    expect(frame.parentElement?.style.aspectRatio).toBe("560 / 315");
  });

  it("uses a responsive default for embeds without usable dimensions", () => {
    const { container } = render(<ArticleContent html='<iframe src="https://www.youtube.com/embed/example" width="100%" height="0"></iframe>' />);
    expect(container.querySelector(".article-embed")).toHaveStyle({ aspectRatio: "16 / 9" });
    expect(container.querySelector("iframe")).toHaveAttribute("title", "Ingesloten media");
  });

  it("includes the cover in the first gallery and lets visitors navigate to body images", () => {
    const { container } = render(<ArticleContent
      html='<p>Introduction</p><img src="/body.jpg" alt="Body poster">'
      coverImage={{ src: "/cover.jpg", alt: "Article cover" }}
    />);
    expect(container.querySelectorAll(".article-gallery")).toHaveLength(1);
    expect(container.querySelectorAll(".article-gallery-item")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Vergroot afbeelding: Article cover" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector("img")).toHaveAttribute("src", "/cover.jpg");
    fireEvent.click(screen.getByRole("button", { name: "Volgende afbeelding" }));
    expect(dialog.querySelector("img")).toHaveAttribute("src", "/body.jpg");
  });

  it("renders a cover-only gallery when the article has no body images", () => {
    const { container } = render(<ArticleContent html="<p>Text only</p>" coverImage={{ src: "/cover.jpg", alt: "Cover" }} />);
    expect(container).toHaveTextContent("Text only");
    expect(container.querySelectorAll(".article-gallery-item")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Vergroot afbeelding: Cover" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("1 / 1");
  });

  it("adds the cover only once with nested and multiple image groups", () => {
    const { container } = render(<ArticleContent
      html='<div><p>Intro</p><img src="/first.jpg"></div><p>More text</p><img src="/second.jpg">'
      coverImage={{ src: "/cover.jpg", alt: "Cover" }}
    />);
    expect(container.querySelectorAll('img[src="/cover.jpg"]')).toHaveLength(1);
    expect(container.querySelectorAll(".article-gallery-item")).toHaveLength(3);
  });

  it("does not duplicate the cover when it is already in the first image group", () => {
    const { container } = render(<ArticleContent html='<img src="/cover.jpg" alt="Cover">' coverImage={{ src: "/cover.jpg", alt: "Cover" }} />);
    expect(container.querySelectorAll(".article-gallery-item")).toHaveLength(1);
  });

  it("groups consecutive Strapi figures and discards image alignment and widths", () => {
    const { container } = render(<ArticleContent html={`
      <p>Article introduction</p>
      <figure class="image image-style-align-left image_resized" style="width:45.22%">
        <img src="/first.jpg" style="width:9999px;height:1px;float:left" alt="First poster">
      </figure>
      <p>&nbsp;</p>
      <figure class="image image-style-align-right" style="width:45.18%">
        <img src="/second.jpg" alt="Second poster">
      </figure>
      <figure class="image image_resized" style="width:46%"><img src="/third.jpg"></figure>
    `} />);
    expect(container.querySelectorAll(".article-gallery")).toHaveLength(1);
    expect(container.querySelectorAll(".article-gallery-item")).toHaveLength(3);
    expect(screen.getByText("Article introduction")).toBeInTheDocument();
    for (const image of screen.getAllByRole("img")) {
      expect(image).not.toHaveAttribute("style");
      expect(image).not.toHaveAttribute("width");
      expect(image).toHaveAttribute("loading", "lazy");
    }
    expect(container.querySelector(".image_resized")).toBeNull();
  });

  it("groups images inside one paragraph, as in the carrousel article", () => {
    const { container } = render(<ArticleContent html={`
      <p><img style="width:50%" src="/one.png"> <img style="width:50%" src="/two.png"></p>
    `} />);
    expect(container.querySelectorAll(".article-gallery")).toHaveLength(1);
    expect(container.querySelectorAll(".article-gallery-item")).toHaveLength(2);
    expect(container.querySelector("p .article-gallery")).toBeNull();
  });

  it("leaves images separated by article text in their original reading order", () => {
    const { container } = render(<ArticleContent html={`
      <img src="/first.jpg" alt="First"><p>Important text between images</p><img src="/second.jpg" alt="Second">
    `} />);
    expect(container.querySelectorAll(".article-gallery")).toHaveLength(2);
    const content = container.querySelector(".article-content")!;
    expect(Array.from(content.children, element => element.tagName)).toEqual(["DIV", "P", "DIV"]);
  });

  it("preserves captions, image links and ordinary article markup", () => {
    render(<ArticleContent html={`
      <h3>Section heading</h3><ul><li>List item</li></ul>
      <p><a href="/tickets" target="_blank">Buy tickets</a></p>
      <figure style="width:1%"><a href="/event"><img src="/poster.png" alt="Event poster"></a>
        <figcaption>A <strong>useful caption</strong></figcaption>
      </figure>
    `} />);
    expect(screen.getByRole("heading", { name: "Section heading" })).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("List item");
    expect(screen.getByRole("link", { name: "Buy tickets" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Bijbehorende link" })).toHaveAttribute("href", "/event");
    expect(screen.getByText("useful caption").tagName).toBe("STRONG");
  });

  it("handles an image mixed with prose without invalid paragraph nesting", () => {
    const { container } = render(<ArticleContent html={`
      <p>Before the picture <img src="/inline.jpg" alt="Inline"> After the picture</p>
    `} />);
    expect(container).toHaveTextContent("Before the picture");
    expect(container).toHaveTextContent("After the picture");
    expect(container.querySelectorAll(".article-gallery")).toHaveLength(1);
    expect(container.querySelector("p .article-gallery")).toBeNull();
  });

  it("supports nested wrappers, missing alt text, spacing, and empty content", () => {
    const view = render(<ArticleContent html={`
      <div><span><img src="/first.jpg"></span><br><div>&nbsp;</div><img src="/second.jpg"></div>
    `} />);
    expect(view.container.querySelectorAll(".article-gallery-item")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Vergroot afbeelding: 1" })).toBeInTheDocument();
    view.rerender(<ArticleContent html="" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("enlarged article images", () => {
  const images = [
    { src: "/first.jpg", alt: "First image", caption: "First caption" },
    { src: "/second.jpg", alt: "Second image", caption: "Second caption" },
  ];

  it("opens the selected image and restores focus when closed", () => {
    render(<ArticleGallery images={images} />);
    const opener = screen.getByRole("button", { name: "Vergroot afbeelding: Second image" });
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Vergrote artikelafbeelding" });
    expect(dialog).toHaveTextContent("2 / 2");
    expect(dialog).toHaveTextContent("Second caption");
    expect(dialog.querySelector("img")).toHaveAttribute("src", "/second.jpg");
    fireEvent.click(screen.getByRole("button", { name: "Sluiten" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("navigates with buttons and arrow keys with wraparound", () => {
    render(<ArticleGallery images={images} />);
    fireEvent.click(screen.getByRole("button", { name: "Vergroot afbeelding: First image" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Volgende afbeelding" }));
    expect(dialog).toHaveTextContent("2 / 2");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(dialog).toHaveTextContent("1 / 2");
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(dialog).toHaveTextContent("2 / 2");
    fireEvent.click(screen.getByRole("button", { name: "Vorige afbeelding" }));
    expect(dialog).toHaveTextContent("1 / 2");
  });

  it("closes through Escape's cancel event or a backdrop click", () => {
    render(<ArticleGallery images={images} />);
    const opener = screen.getByRole("button", { name: "Vergroot afbeelding: First image" });
    fireEvent.click(opener);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { bubbles: true, cancelable: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not show navigation for a single image", () => {
    render(<ArticleGallery images={[images[0]]} />);
    fireEvent.click(screen.getByRole("button", { name: "Vergroot afbeelding: First image" }));
    expect(screen.queryByRole("button", { name: "Volgende afbeelding" })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" });
    expect(screen.getByRole("dialog")).toHaveTextContent("1 / 1");
  });
});

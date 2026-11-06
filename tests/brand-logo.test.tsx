// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BrandLogo, { brandLogoUrl, originalBrandLogoUrl } from "@/components/BrandLogo";

describe("brand logo quality exception", () => {
  const original = "https://res.cloudinary.com/test/image/upload/v1732663479/logo.png";
  it("removes chained Cloudinary transformations but retains the original asset/version", () => {
    expect(originalBrandLogoUrl("https://res.cloudinary.com/test/image/upload/q_auto:eco/dpr_auto/c_scale/w_120/v1732663479/logo.png")).toBe(original);
    expect(originalBrandLogoUrl(original)).toBe(original);
    expect(originalBrandLogoUrl("/logo.png")).toBe("/logo.png");
    expect(originalBrandLogoUrl("https://example.com/image/upload/w_120/v123/logo.png"))
      .toBe("https://example.com/image/upload/w_120/v123/logo.png");
  });
  it("uses quality 100 at three times display width without Next recompression", () => {
    render(<BrandLogo src={original} width={120} priority />);
    const image = screen.getByAltText("Logo");
    expect(image).toHaveAttribute("src", "https://res.cloudinary.com/test/image/upload/f_auto,q_100,c_limit,w_360/v1732663479/logo.png");
    expect(image).not.toHaveAttribute("srcset");
    expect(image).toHaveStyle({ width: "120px", height: "auto" });
  });
  it("replaces old low-quality transformations and leaves other hosts untouched", () => {
    expect(brandLogoUrl("https://res.cloudinary.com/test/image/upload/q_auto:eco/w_120/v1732663479/logo.png", 200))
      .toBe("https://res.cloudinary.com/test/image/upload/f_auto,q_100,c_limit,w_600/v1732663479/logo.png");
    expect(brandLogoUrl("/logo.png", 120)).toBe("/logo.png");
  });
});

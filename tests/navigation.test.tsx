// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SidebarLinks from "@/components/Sidebar/SidebarLinks";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/current-page") }));

describe("shared desktop and mobile navigation", () => {
  it("renders Strapi links without injecting a hardcoded ticket entry", () => {
    render(<SidebarLinks menu={[{ title: "Home", path: "/" }]} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: "Tickets" })).not.toBeInTheDocument();
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
  });

  it("opens an external shop in a new tab and dismisses the mobile menu", () => {
    const toggleSidebar = vi.fn();
    render(<SidebarLinks
      menu={[{ title: "Tickets", path: "https://entrii.shop/carnaval-radio#" }]}
      toggleSidebar={toggleSidebar}
    />);
    const link = screen.getByRole("link", { name: "Tickets" });
    expect(link).toHaveAttribute("href", "https://entrii.shop/carnaval-radio#");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    fireEvent.click(link);
    expect(toggleSidebar).toHaveBeenCalledOnce();
  });

  it("uses a direct external link for a legacy footer ticket path", () => {
    render(<Footer
      data={[{ title: "Links", items: [{ title: "Tickets", path: "/tickets" }] }]}
      themeData={{ attributes: { Logo: { data: { attributes: { url: "/logo.png" } } } } }}
    />);
    const link = screen.getByRole("link", { name: "Tickets" });
    expect(link).toHaveAttribute("href", "https://entrii.shop/carnaval-radio#");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("hydrates without a mismatch when a rewrite changes the sidebar pathname", async () => {
    const menu = <SidebarLinks menu={[{ title: "Favorieten", path: "/favorieten" }]} />;
    const container = document.createElement("div");
    vi.mocked(usePathname).mockReturnValueOnce("/favorites");
    container.innerHTML = renderToString(menu);
    const onRecoverableError = vi.fn();
    vi.mocked(usePathname).mockReturnValue("/favorieten");
    const root = await act(async () => hydrateRoot(container, menu, { onRecoverableError }));
    try {
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(container.querySelector("p")).toHaveClass("font-semibold");
    } finally {
      act(() => root.unmount());
      vi.mocked(usePathname).mockReturnValue("/current-page");
    }
  });

  it("renders an empty menu when none is provided", () => {
    render(<SidebarLinks />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("highlights the current page", () => {
    render(<SidebarLinks menu={[{ title: "Current", path: "/current-page", Icon: "<MdHome />" }]} />);
    expect(screen.getByText("Current")).toHaveClass("font-semibold");
  });

  it("expands a nested menu and navigates using the existing slug convention", () => {
    const toggleSidebar = vi.fn();
    render(<SidebarLinks
      menu={[{
        title: "Team",
        path: "/team",
        items: [{ title: "Volunteers", path: "/team/volunteers" }],
      }]}
      toggleSidebar={toggleSidebar}
    />);
    const submenu = screen.getByText("Volunteers").parentElement;
    expect(submenu).toHaveClass("hidden");
    fireEvent.click(screen.getByText("Team"));
    expect(submenu).not.toHaveClass("hidden");
    const child = screen.getByRole("link", { name: "Volunteers" });
    expect(child).toHaveAttribute("href", "/volunteers");
    child.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(child);
    expect(toggleSidebar).toHaveBeenCalledOnce();
  });

  it("supports a nested current page and an empty child path", () => {
    render(<SidebarLinks menu={[{
      title: "Current section",
      path: "/current-page",
      items: [{ title: "Fallback", path: "" }],
    }]} />);
    expect(screen.getByText("Current section")).toHaveClass("font-semibold");
    fireEvent.click(screen.getByText("Current section"));
    expect(screen.getByRole("link", { name: "Fallback" })).toHaveAttribute("href", "/");
  });
});

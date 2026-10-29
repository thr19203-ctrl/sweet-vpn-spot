import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";

import { Home } from "@/components/home";
import { LANGS } from "@/lib/i18n";
import { Route } from "@/routes/index";

const HomePage = Route.options.component as ComponentType;

describe("Home page rendering", () => {
  it("renders the hero, both plans, the workflow and the language switcher", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Обходи любые блоки.");
    expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Посмотри, как работает Cfg." }),
    ).toBeInTheDocument();

    const cards = document.querySelectorAll("[data-plan]");
    expect(cards).toHaveLength(2);
    expect(cards[0]?.getAttribute("data-plan")).toBe("Plus");
    expect(cards[0]?.textContent).toContain("$2.99");
    expect(cards[1]?.getAttribute("data-plan")).toBe("Pro");
    expect(cards[1]?.textContent).toContain("$9.99");

    expect(screen.getByRole("link", { name: "Условиями использования" })).toHaveAttribute(
      "href",
      "/terms",
    );
  });

  it("shows a readable fallback instead of a dead player when the video CDN fails", () => {
    const { container } = render(<HomePage />);

    const video = container.querySelector("video");
    expect(video).not.toBeNull();

    fireEvent.error(video as HTMLVideoElement);

    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Демо-видео временно недоступно.");
    expect(screen.getByRole("button", { name: "Попробовать снова" })).toBeInTheDocument();
  });

  it("renders the page in the language of the URL", () => {
    render(<Home lang="de" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(LANGS["de"]?.d.h1 ?? "");
  });

  it("closes the mobile menu on an outside click and on Escape, but not on its own button", () => {
    const { container } = render(<Home />);
    const summary = container.querySelector('summary[aria-label="Menu"]');
    const menu = summary?.closest("details") as HTMLDetailsElement;

    menu.open = true;
    fireEvent.pointerDown(summary as Element);
    expect(menu.open).toBe(true);

    fireEvent.pointerDown(document.body);
    expect(menu.open).toBe(false);

    menu.open = true;
    fireEvent.keyDown(document, { key: "Escape" });
    expect(menu.open).toBe(false);
  });
});

"use client";

import { useEffect } from "react";

export function MarketingPageRuntime({
  nextSectionId,
  finalSectionId,
}: {
  nextSectionId: string;
  finalSectionId?: string;
}) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".r"));

    if (!elements.length) {
      return;
    }

    if (typeof IntersectionObserver !== "function") {
      elements.forEach((element) => element.classList.add("v"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("v");
          }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    const fallbackTimer = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".r:not(.v)").forEach((element) => {
        element.classList.add("v");
      });
    }, 400);

    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const heroNav = document.getElementById("heroNav");
    const dockNav = document.getElementById("dockNav");
    const nextSection = document.getElementById(nextSectionId);
    const finalSection = finalSectionId ? document.getElementById(finalSectionId) : null;

    if (!heroNav || !dockNav || !nextSection) {
      return;
    }

    const sync = () => {
      const reachedContent = nextSection.getBoundingClientRect().top <= window.innerHeight * 0.72;
      const reachedFinal = finalSection
        ? finalSection.getBoundingClientRect().top <= window.innerHeight * 0.9
        : false;
      const showDock = reachedContent && !reachedFinal;

      heroNav.classList.toggle("is-hidden", reachedContent);
      dockNav.classList.toggle("is-visible", showDock);
      dockNav.setAttribute("aria-hidden", String(!showDock));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [finalSectionId, nextSectionId]);

  useEffect(() => {
    const root = document.documentElement;
    const toggles = Array.from(document.querySelectorAll<HTMLElement>("[data-theme-toggle]"));
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const storageKey = "kuest-theme-mode";
    const themeColorFallbacks = { light: "#0e1117", dark: "#CDFF00" } as const;

    if (!toggles.length) {
      return;
    }

    const getMode = () => (root.getAttribute("data-theme-mode") === "dark" ? "dark" : "light");
    const getThemeColor = () => {
      try {
        const accent = getComputedStyle(root).getPropertyValue("--color-accent").trim();
        if (accent) {
          return accent;
        }
      } catch {
        // noop
      }

      return themeColorFallbacks[getMode()];
    };
    const getToggleLabel = (toggle: HTMLElement, mode: "light" | "dark") => {
      const fallbackDark = "Switch to dark mode";
      const fallbackLight = "Switch to light mode";

      return mode === "light"
        ? toggle.getAttribute("data-label-to-dark") || fallbackDark
        : toggle.getAttribute("data-label-to-light") || fallbackLight;
    };
    const syncToggles = () => {
      const mode = getMode();

      toggles.forEach((toggle) => {
        const label = getToggleLabel(toggle, mode);
        toggle.setAttribute("aria-pressed", String(mode === "dark"));
        toggle.setAttribute("aria-label", label);
        toggle.setAttribute("title", label);
      });

      if (themeMeta) {
        themeMeta.setAttribute("content", getThemeColor());
      }
    };
    const persistMode = (mode: "light" | "dark") => {
      try {
        window.localStorage.setItem(storageKey, mode);
      } catch {
        // noop
      }
    };
    const applyMode = (mode: "light" | "dark", persist = false) => {
      root.setAttribute("data-theme-mode", mode);
      if (persist) {
        persistMode(mode);
      }
      syncToggles();
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    };

    let storedMode: "light" | "dark" | null = null;
    try {
      const value = window.localStorage.getItem(storageKey);
      storedMode = value === "light" || value === "dark" ? value : null;
    } catch {
      storedMode = null;
    }

    applyMode(storedMode || getMode());

    const handlers = toggles.map((toggle) => {
      const handler = () => applyMode(getMode() === "light" ? "dark" : "light", true);
      toggle.addEventListener("click", handler);
      return { toggle, handler };
    });

    return () => {
      handlers.forEach(({ toggle, handler }) => {
        toggle.removeEventListener("click", handler);
      });
    };
  }, []);

  useEffect(() => {
    const controls = Array.from(document.querySelectorAll<HTMLElement>(".site-language-control")).filter(
      (control) =>
        Boolean(control.querySelector(".site-language-trigger")) &&
        Boolean(control.querySelector(".site-language-menu")),
    );

    if (!controls.length) {
      return;
    }

    const setOpen = (control: HTMLElement, open: boolean) => {
      control.dataset.open = open ? "true" : "false";
      const button = control.querySelector<HTMLElement>(".site-language-trigger");
      if (button) {
        button.setAttribute("aria-expanded", String(open));
      }
    };

    const buttonHandlers = controls
      .map((control) => {
        const button = control.querySelector<HTMLElement>(".site-language-trigger");
        if (!button) {
          return null;
        }

        setOpen(control, false);

        const handler = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(control, control.dataset.open !== "true");
        };

        button.addEventListener("click", handler);
        return { button, handler };
      })
      .filter(Boolean) as Array<{ button: HTMLElement; handler: EventListener }>;

    const menuHandlers = controls
      .map((control) => {
        const menu = control.querySelector<HTMLElement>(".site-language-menu");
        if (!menu) {
          return null;
        }

        const handler = () => setOpen(control, false);
        menu.addEventListener("click", handler);
        return { menu, handler };
      })
      .filter(Boolean) as Array<{ menu: HTMLElement; handler: EventListener }>;

    const handleDocumentClick = (event: MouseEvent) => {
      controls.forEach((control) => {
        if (!control.contains(event.target as Node)) {
          setOpen(control, false);
        }
      });
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      controls.forEach((control) => setOpen(control, false));
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      buttonHandlers.forEach(({ button, handler }) => {
        button.removeEventListener("click", handler);
      });
      menuHandlers.forEach(({ menu, handler }) => {
        menu.removeEventListener("click", handler);
      });
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return null;
}

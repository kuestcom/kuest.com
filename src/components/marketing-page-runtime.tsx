"use client";

import { useEffect } from "react";

type AttentionScrollStep =
  | {
      type: "brands";
      brands: HTMLElement[];
    }
  | {
      type: "line";
      words: HTMLSpanElement[];
    };

const ATTENTION_PUNCTUATION_TOKEN_RE = /^[.,!?;:…%]+$/u;
const ATTENTION_SCROLL_TRAVEL_FACTOR = 1;
const ATTENTION_SCROLL_HOLD_FACTOR = 0.02;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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
    const timelines = Array.from(document.querySelectorAll<HTMLElement>(".solution-timeline"));

    if (!timelines.length) {
      return;
    }

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver !== "function") {
      timelines.forEach((timeline) => timeline.classList.add("is-revealed"));
      return;
    }

    const revealTimeline = (timeline: HTMLElement, observer: IntersectionObserver) => {
      timeline.classList.add("is-revealed");
      observer.unobserve(timeline);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealTimeline(entry.target as HTMLElement, observer);
          }
        });
      },
      { threshold: 0.56, rootMargin: "0px 0px -4% 0px" },
    );

    timelines.forEach((timeline) => observer.observe(timeline));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = document.getElementById("p1-scroll");
    const steps = section
      ? Array.from(section.querySelectorAll<HTMLElement>("[data-attention-step]"))
      : [];

    if (!section || !steps.length) {
      return;
    }

    const locale = document.documentElement.lang || "en";
    const segmenter =
      typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter(locale, { granularity: "word" })
        : null;
    const blocks = Array.from(section.querySelectorAll<HTMLElement>(".attention-scroll-block"));
    const copy = section.querySelector<HTMLElement>(".attention-scroll-copy");
    const dockNav = document.getElementById("dockNav");

    if (!copy || !blocks.length) {
      return;
    }

    let ticking = false;
    let palette = {
      bg: [14, 17, 23] as [number, number, number],
      text: [232, 234, 240] as [number, number, number],
    };

    const parseRgbTriplet = (value: string, fallback: [number, number, number]) => {
      const parts = String(value)
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter(Number.isFinite);

      return parts.length === 3
        ? ([parts[0], parts[1], parts[2]] as [number, number, number])
        : fallback;
    };

    const readPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      palette = {
        bg: parseRgbTriplet(styles.getPropertyValue("--bg-rgb"), [14, 17, 23]),
        text: parseRgbTriplet(styles.getPropertyValue("--text-rgb"), [232, 234, 240]),
      };
    };

    const splitLine = (line: HTMLElement) => {
      const text = line.textContent ?? "";
      line.setAttribute("aria-label", text);
      line.textContent = "";

      const segments = segmenter
        ? Array.from(segmenter.segment(text), (part) => part.segment)
        : text.split(/(\s+)/);
      const words: HTMLSpanElement[] = [];
      let previousWasWhitespace = false;

      segments.forEach((segment) => {
        if (!segment) {
          return;
        }

        if (/^\s+$/.test(segment)) {
          line.append(document.createTextNode(segment));
          previousWasWhitespace = true;
          return;
        }

        if (ATTENTION_PUNCTUATION_TOKEN_RE.test(segment) && !previousWasWhitespace && words.length) {
          words[words.length - 1].textContent += segment;
          previousWasWhitespace = false;
          return;
        }

        const word = document.createElement("span");
        word.className = "attention-scroll-word";
        word.textContent = segment;
        line.append(word);
        words.push(word);
        previousWasWhitespace = false;
      });

      return words;
    };

    const stepData: AttentionScrollStep[] = steps.map((step) => {
      if (step.dataset.attentionStep === "brands") {
        return {
          type: "brands",
          brands: Array.from(step.querySelectorAll<HTMLElement>(".attention-scroll-brand")),
        };
      }

      return {
        type: "line",
        words: splitLine(step),
      };
    });

    const applyColor = (target: HTMLElement, progress: number) => {
      const eased = progress * progress * (3 - 2 * progress);
      const alpha = clamp((progress - 0.05) / 0.22, 0, 1);
      const red = Math.round(palette.bg[0] + (palette.text[0] - palette.bg[0]) * eased);
      const green = Math.round(palette.bg[1] + (palette.text[1] - palette.bg[1]) * eased);
      const blue = Math.round(palette.bg[2] + (palette.text[2] - palette.bg[2]) * eased);
      const strokeAlpha = alpha === 0 ? "0" : ((1 - eased) * 0.08 * alpha).toFixed(3);
      const strokeColor = `rgba(${palette.text[0]}, ${palette.text[1]}, ${palette.text[2]}, ${strokeAlpha})`;

      target.style.color = `rgb(${red} ${green} ${blue})`;
      target.style.opacity = String(alpha);
      target.style.setProperty("-webkit-text-stroke-color", strokeColor);
      target.style.setProperty("text-stroke-color", strokeColor);
    };

    const measure = () => {
      const firstBlock = blocks[0];
      const lastBlock = blocks[blocks.length - 1];
      const firstCenter = firstBlock.offsetTop + firstBlock.offsetHeight / 2;
      const lastCenter = lastBlock.offsetTop + lastBlock.offsetHeight / 2;
      const contentTravel = Math.max(lastCenter - firstCenter, 1);
      const travel = Math.max(contentTravel * ATTENTION_SCROLL_TRAVEL_FACTOR, 1);
      const hold = window.innerHeight * ATTENTION_SCROLL_HOLD_FACTOR;

      section.style.height = `${Math.ceil(window.innerHeight + travel + hold)}px`;

      return { firstCenter, lastCenter, travel };
    };

    const render = () => {
      ticking = false;
      readPalette();

      const metrics = measure();
      const trackProgress = clamp((window.scrollY - section.offsetTop) / metrics.travel, 0, 1);
      const dockRect =
        dockNav && dockNav.classList.contains("is-visible") ? dockNav.getBoundingClientRect() : null;
      const anchorY = dockRect ? dockRect.top - 16 : window.innerHeight * 0.8;
      const fadeRange = Math.max(84, window.innerHeight * 0.14);
      const startShift = window.innerHeight * 0.5 - metrics.firstCenter;
      const endShift = window.innerHeight * 0.5 - metrics.lastCenter;
      const shift = startShift + (endShift - startShift) * trackProgress;

      copy.style.transform = `translate3d(0, ${shift}px, 0)`;

      stepData.forEach((step) => {
        if (step.type === "brands") {
          step.brands.forEach((brand, brandIndex) => {
            const rect = brand.getBoundingClientRect();
            const brandProgress = clamp((anchorY - (rect.top + brandIndex * 12)) / fadeRange, 0, 1);
            brand.style.opacity = String(0.12 + brandProgress * 0.88);
          });
          return;
        }

        step.words.forEach((word, wordIndex) => {
          const rect = word.getBoundingClientRect();
          const wordProgress = clamp((anchorY - (rect.top + wordIndex * 3)) / fadeRange, 0, 1);
          applyColor(word, wordProgress);
        });
      });
    };

    const queue = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    let isDisposed = false;

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!isDisposed) {
          queue();
        }
      });
    }

    return () => {
      isDisposed = true;
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
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
          const nextOpen = control.dataset.open !== "true";
          setOpen(control, nextOpen);

          if (!nextOpen && document.activeElement === button) {
            button.blur();
          }
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

      const activeElement = document.activeElement;

      controls.forEach((control) => {
        setOpen(control, false);

        if (activeElement instanceof HTMLElement && control.contains(activeElement)) {
          activeElement.blur();
        }
      });
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

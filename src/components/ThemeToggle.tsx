"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function updateThemeColor(mode: ThemeMode) {
  const themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!themeMeta) {
    return;
  }

  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();
  const fallback = mode === "dark" ? "#CDFF00" : "#0e1117";
  themeMeta.setAttribute("content", accent || fallback);
}

export default function ThemeToggle({
  id,
  className,
  labelToDark,
  labelToLight,
}: {
  id: string;
  className: string;
  labelToDark: string;
  labelToLight: string;
}) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("kuest-theme-mode");
    const initialMode: ThemeMode = stored === "light" ? "light" : "dark";
    setMode(initialMode);
    document.documentElement.dataset.themeMode = initialMode;
  }, []);

  const label = mode === "dark" ? labelToLight : labelToDark;

  function handleClick() {
    const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(nextMode);
    localStorage.setItem("kuest-theme-mode", nextMode);
    document.documentElement.dataset.themeMode = nextMode;
    window.requestAnimationFrame(() => updateThemeColor(nextMode));
  }

  return (
    <button
      type="button"
      id={id}
      className={className}
      data-theme-toggle
      data-label-to-dark={labelToDark}
      data-label-to-light={labelToLight}
      aria-label={label}
      aria-pressed={mode === "dark"}
      title={label}
      onClick={handleClick}
    >
      <span className="dock-theme-toggle-inner" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-icon-light">
          <Sun />
        </span>
        <span className="theme-toggle-icon theme-toggle-icon-dark">
          <Moon />
        </span>
      </span>
    </button>
  );
}

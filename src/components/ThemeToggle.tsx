import {Moon, Sun,} from "lucide-react";

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
  return (
    <button
      type="button"
      id={id}
      className={className}
      data-theme-toggle
      data-label-to-dark={labelToDark}
      data-label-to-light={labelToLight}
      aria-label={labelToDark}
      aria-pressed="false"
      title={labelToDark}
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


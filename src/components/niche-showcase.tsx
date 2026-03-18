"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { ShowcaseIcon } from "@/components/marketing-shared";
import type { ShowcaseNiche } from "@/lib/marketing-shared-data";

export function NicheShowcase({
  niches,
  yesLabel,
  noLabel,
}: {
  niches: ReadonlyArray<ShowcaseNiche>;
  yesLabel: string;
  noLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || niches.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % niches.length);
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, niches.length]);

  const safeActiveIndex = niches.length ? Math.min(activeIndex, niches.length - 1) : 0;
  const activeNiche = niches[safeActiveIndex] ?? niches[0];

  if (!activeNiche) {
    return null;
  }

  return (
    <div
      className="prediction-explainer-stage r rd"
      id="predictionExplainerStage"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="prediction-showcase-tabs niche-tabs-wrap" id="predictionNicheTabs">
        {niches.map((niche, index) => (
          <button
            key={niche.tag}
            type="button"
            className={`niche-tab${index === safeActiveIndex ? " is-active" : ""}`}
            data-prediction-niche={index}
            onClick={() => setActiveIndex(index)}
            style={
              index === safeActiveIndex
                ? {
                    borderColor: `rgba(${niche.accentRgb},0.46)`,
                    background: `rgba(${niche.accentRgb},0.12)`,
                    color: niche.accent,
                    boxShadow:
                      "0 10px 28px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.03)",
                  }
                : undefined
            }
          >
            <ShowcaseIcon name={niche.icon} /> {niche.tag}
          </button>
        ))}
      </div>
      <div className="prediction-showcase-grid" id="predictionNicheCardsGrid">
        {activeNiche.cards.map((card) => {
          const rows =
            card.type === "single"
              ? [
                  { label: yesLabel, pct: card.pct },
                  { label: noLabel, pct: Math.max(0, 100 - card.pct) },
                ]
              : card.rows;
          const titleLength = card.title.length;
          const titleClassName = `prediction-showcase-title${titleLength > 78 ? " is-xlong" : titleLength > 58 ? " is-long" : ""}`;

          return (
            <article
              key={card.title}
              className="prediction-showcase-card"
              style={
                {
                  ["--prediction-accent" as string]: activeNiche.accent,
                  ["--prediction-accent-rgb" as string]: activeNiche.accentRgb,
                } as CSSProperties
              }
            >
              <Image
                src={card.img}
                alt=""
                width={92}
                height={92}
                className="prediction-showcase-thumb"
              />
              <h3 className={titleClassName}>{card.title}</h3>
              <div className="prediction-showcase-list">
                {rows.map((row) => (
                  <div key={`${card.title}-${row.label}`} className="prediction-showcase-row">
                    <span className="prediction-showcase-row-label">{row.label}</span>
                    <span className="prediction-showcase-row-track">
                      <span className="prediction-showcase-row-fill" style={{ width: `${row.pct}%` }} />
                    </span>
                    <span className="prediction-showcase-row-pct">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

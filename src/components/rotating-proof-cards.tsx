"use client";

import { useEffect, useState } from "react";
import type { ProofCard } from "@/lib/marketing-shared-data";

export function RotatingProofCards({ cards }: { cards: ReadonlyArray<ProofCard> }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (cards.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % cards.length);
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cards.length]);

  return (
    <div className="solution-proof-rotator" id="solutionProofRotator">
      {cards.map((card, index) => (
        <article
          key={`${card.label}-${card.value}`}
          className={`solution-proof-card${index === activeIndex ? " is-active" : ""}`}
        >
          <div className="solution-proof-card-label">{card.label}</div>
          <div className="solution-proof-card-value">{card.value}</div>
          <div
            className="solution-proof-card-copy"
            dangerouslySetInnerHTML={{ __html: card.copyHtml }}
          />
        </article>
      ))}
    </div>
  );
}

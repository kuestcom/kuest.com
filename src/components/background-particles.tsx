"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  o: number;
}

const BLUE_RGB = "79,142,247";

function makeParticle(): Particle {
  return {
    x: Math.random() * 2,
    y: Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
    s: Math.random() * 1.4 + 0.4,
    o: Math.random() * 0.4 + 0.1,
  };
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) {
      return;
    }

    const ctx = cv.getContext("2d");
    if (!ctx) {
      return;
    }

    let rafId = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const resize = () => {
      width = cv.width = window.innerWidth;
      height = cv.height = window.innerHeight;
    };

    const seedParticles = () => {
      particles = Array.from({ length: 55 }, () => makeParticle());
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > 1) {
          p.vx *= -1;
        }
        if (p.y < 0 || p.y > 1) {
          p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${BLUE_RGB},${p.o})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = (a.x - b.x) * width;
          const dy = (a.y - b.y) * height;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance >= 120) {
            continue;
          }

          const alpha = 0.08 * (1 - distance / 120);

          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.strokeStyle = `rgba(${BLUE_RGB},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      rafId = window.requestAnimationFrame(draw);
    };

    resize();
    seedParticles();
    draw();

    const onResize = () => {
      resize();
      seedParticles();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className="launch-bg-canvas" aria-hidden />;
}

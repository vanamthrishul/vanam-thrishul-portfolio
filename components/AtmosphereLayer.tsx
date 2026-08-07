"use client";

import { useEffect, useRef } from "react";

type Blob = {
  x: number;
  y: number;
  r: number;
  color: string;
  sx: number;
  sy: number;
  depth: number;
};

const BLOBS: Blob[] = [
  { x: 0.2, y: 0.22, r: 0.52, color: "rgba(176,38,255,0.16)", sx: 0.00011, sy: 0.00014, depth: 0.3 },
  { x: 0.82, y: 0.48, r: 0.58, color: "rgba(0,229,255,0.12)", sx: -0.00009, sy: 0.00012, depth: 0.6 },
  { x: 0.5, y: 0.78, r: 0.46, color: "rgba(148,143,184,0.15)", sx: 0.00013, sy: -0.0001, depth: 0.15 },
  { x: 0.1, y: 0.85, r: 0.4, color: "rgba(0,229,255,0.08)", sx: -0.00012, sy: -0.00013, depth: 0.45 },
];

export default function AtmosphereLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    window.addEventListener("resize", fit);

    let raf = 0;

    function draw(time: number) {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      const scrollY = window.scrollY;
      ctx!.clearRect(0, 0, w, h);

      BLOBS.forEach((b) => {
        const drift = reduced ? 0 : time;
        const parallax = scrollY * b.depth * 0.05;
        const x = (b.x + Math.sin(drift * b.sx) * 0.06) * w;
        const y = (b.y + Math.cos(drift * b.sy) * 0.06) * h - parallax;
        const r = b.r * Math.max(w, h);
        const g = ctx!.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, w, h);
      });

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", fit);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="atmosphere-layer" aria-hidden="true" />;
}

"use client";

import { useEffect, useRef } from "react";

// Low, slow-rolling fog banks hugging the bottom of the viewport, plus a
// faint cold haze up top - the "night mist" from the emblem render.
type FogBank = {
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  rx: number; // horizontal radius, fraction of width
  ry: number; // vertical radius, fraction of height
  alpha: number;
  speed: number; // horizontal drift, fraction of width per ms
  phase: number;
};

const FOG: FogBank[] = [
  { x: 0.15, y: 0.98, rx: 0.55, ry: 0.22, alpha: 0.2, speed: 0.000006, phase: 0 },
  { x: 0.6, y: 1.02, rx: 0.6, ry: 0.2, alpha: 0.17, speed: -0.000005, phase: 1.7 },
  { x: 0.95, y: 0.95, rx: 0.45, ry: 0.18, alpha: 0.15, speed: 0.000004, phase: 3.1 },
  { x: 0.4, y: 0.88, rx: 0.35, ry: 0.12, alpha: 0.08, speed: 0.000007, phase: 4.4 },
  { x: 0.78, y: 0.15, rx: 0.5, ry: 0.35, alpha: 0.06, speed: -0.000003, phase: 2.2 },
];

// Dust motes drifting upward through the fog, twinkling slightly.
type Mote = { x: number; y: number; r: number; vy: number; vx: number; depth: number; twinkle: number };

const MOTE_COUNT = 70;

export default function AtmosphereLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const moteCount = isTouch ? Math.round(MOTE_COUNT * 0.5) : MOTE_COUNT;

    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    window.addEventListener("resize", fit);

    const motes: Mote[] = Array.from({ length: moteCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.4,
      vy: -(Math.random() * 0.00003 + 0.00001),
      vx: (Math.random() - 0.5) * 0.00001,
      depth: Math.random(),
      twinkle: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let last = 0;

    function draw(time: number) {
      const dt = last ? Math.min(time - last, 50) : 16;
      last = time;
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      const scrollY = window.scrollY;
      ctx!.clearRect(0, 0, w, h);

      // fog: elliptical radial gradients (circle gradient squashed via scale)
      FOG.forEach((f) => {
        const t = reduced ? 0 : time;
        const x = (((f.x + t * f.speed + Math.sin(t * 0.00008 + f.phase) * 0.03) % 1.4) + 1.4) % 1.4 - 0.2;
        const y = f.y + Math.sin(t * 0.00006 + f.phase) * 0.015;
        const rx = f.rx * w;
        const ry = f.ry * h;
        ctx!.save();
        ctx!.translate(x * w, y * h);
        ctx!.scale(1, ry / rx);
        const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, `rgba(120,130,175,${f.alpha})`);
        g.addColorStop(0.5, `rgba(80,88,135,${f.alpha * 0.45})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(-rx, -rx, rx * 2, rx * 2);
        ctx!.restore();
      });

      // dust motes - nearer motes (higher depth) move and parallax more
      motes.forEach((m) => {
        if (!reduced) {
          m.y += m.vy * dt * (0.5 + m.depth);
          m.x += m.vx * dt;
          if (m.y < -0.02) {
            m.y = 1.02;
            m.x = Math.random();
          }
          if (m.x < 0) m.x += 1;
          if (m.x > 1) m.x -= 1;
        }
        const py = ((((m.y * h - scrollY * m.depth * 0.15) % h) + h) % h);
        const flicker = reduced ? 0.7 : 0.55 + Math.sin(time * 0.0015 + m.twinkle) * 0.35;
        ctx!.beginPath();
        ctx!.arc(m.x * w, py, m.r * (0.6 + m.depth * 0.6), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(185,198,255,${(0.25 + m.depth * 0.45) * flicker})`;
        ctx!.fill();
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

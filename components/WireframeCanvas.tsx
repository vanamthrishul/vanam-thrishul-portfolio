"use client";

import { useEffect, useRef } from "react";
import { ICOSAHEDRON_VERTICES, buildIcosahedronEdges, projectVertex } from "@/lib/icosahedron";

type Particle = { x: number; y: number; vx: number; vy: number };

const PARTICLE_COUNT = 60;
const EDGES = buildIcosahedronEdges();

export default function WireframeCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const particleCount = isTouch ? Math.round(PARTICLE_COUNT * 0.5) : PARTICLE_COUNT;

    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    window.addEventListener("resize", fit);

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00014,
      vy: (Math.random() - 0.5) * 0.00014,
    }));

    function drawFrame(time: number) {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      // constellation
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      });
      const linkDist = Math.min(w, h) * 0.12;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = (particles[i].x - particles[j].x) * w;
          const dy = (particles[i].y - particles[j].y) * h;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx!.strokeStyle = `rgba(176,38,255,${0.12 * (1 - d / linkDist)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x * w, particles[i].y * h);
            ctx!.lineTo(particles[j].x * w, particles[j].y * h);
            ctx!.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x * w, p.y * h, 1.3, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(0,229,255,0.4)";
        ctx!.fill();
      });

      // rotating wireframe
      const angleY = time * 0.00025;
      const angleX = time * 0.00017;
      const cx = w * (w > 760 ? 0.74 : 0.5);
      const cy = h * (w > 760 ? 0.48 : 0.72);
      const radius = Math.min(w, h) * (w > 760 ? 0.2 : 0.16);

      const projected = ICOSAHEDRON_VERTICES.map((v) =>
        projectVertex(v, angleX, angleY, cx, cy, radius)
      );

      EDGES.forEach(([a, b]) => {
        const p1 = projected[a];
        const p2 = projected[b];
        const depth = (p1.z + p2.z) / 2;
        const glow = (depth + 1.7) / 3.4;
        ctx!.strokeStyle = `rgba(${Math.round(176 - glow * 80)},${Math.round(38 + glow * 191)},255,${0.35 + glow * 0.55})`;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.moveTo(p1.x, p1.y);
        ctx!.lineTo(p2.x, p2.y);
        ctx!.stroke();
      });
      projected.forEach((p) => {
        const glow = (p.z + 1.7) / 3.4;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2 + glow * 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0,229,255,${0.5 + glow * 0.5})`;
        ctx!.fill();
      });

      if (!reduced) raf = requestAnimationFrame(drawFrame);
    }

    let raf = 0;
    if (reduced) {
      drawFrame(0);
    } else {
      raf = requestAnimationFrame(drawFrame);
    }

    return () => {
      window.removeEventListener("resize", fit);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

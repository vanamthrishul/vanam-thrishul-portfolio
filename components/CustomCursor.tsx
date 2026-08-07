"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
      if (reduced && ring) ring.style.transform = `translate(${mouseX - 16}px, ${mouseY - 16}px)`;
    }

    function onOver(e: MouseEvent) {
      if (!ring) return;
      if ((e.target as HTMLElement).closest("[data-cursor='hover']")) {
        ring.classList.add("cursor-ring--active");
      }
    }
    function onOut(e: MouseEvent) {
      if (!ring) return;
      if ((e.target as HTMLElement).closest("[data-cursor='hover']")) {
        ring.classList.remove("cursor-ring--active");
      }
    }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    let raf = 0;
    function tick() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring) ring.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;
      raf = requestAnimationFrame(tick);
    }
    if (!reduced) raf = requestAnimationFrame(tick);

    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span className="cursor-ring-inner" />
      </div>
    </>
  );
}

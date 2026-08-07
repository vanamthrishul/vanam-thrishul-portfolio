"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WireframeCanvas from "./WireframeCanvas";
import MagneticButton from "./MagneticButton";
import { hero } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

function useGlitchReveal(text: string) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const glyphs = "!<>-_\\/[]{}=+*^?#01";
    const duration = 900;
    let start: number | null = null;
    let raf = 0;

    function frame(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const revealCount = Math.floor(progress * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          out += " ";
          continue;
        }
        out += i < revealCount ? text[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el!.textContent = out;
      if (progress < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        el!.textContent = text;
      }
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return ref;
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDecimal = String(value).includes(".");
    if (reduced) {
      el.textContent = String(value);
      return;
    }
    let start: number | null = null;
    let raf = 0;
    const duration = 1200;

    function frame(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = value * eased;
      el!.textContent = isDecimal ? val.toFixed(2) : String(Math.round(val));
      if (progress < 1) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="hero-stat">
      <span className="hero-stat__num">
        <span ref={numRef}>0</span>
        <span className="hero-stat__suffix">{suffix}</span>
      </span>
      <span className="hero-stat__label">{label}</span>
    </div>
  );
}

export default function Hero() {
  const stageRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useGlitchReveal(hero.headline);

  // brief pin: the hero holds in the viewport while its content
  // resolves from a tilted/blurred entrance, then releases into the
  // normally-scrolling Work section.
  useEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.set(content, { rotateX: -16, y: 50, z: -140, opacity: 0, filter: "blur(10px)" });

    const tween = gsap.to(content, {
      rotateX: 0,
      y: 0,
      z: 0,
      opacity: 1,
      filter: "blur(0px)",
      ease: "none",
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "+=70%",
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section ref={stageRef} className="hero-stage reveal-perspective">
      <WireframeCanvas className="hero-canvas" />
      <div ref={contentRef} className="hero-content">
        <p className="hero-eyebrow">{hero.eyebrow}</p>
        <h1 ref={headingRef} className="hero-heading">
          {hero.headline}
        </h1>
        <p className="hero-sub">{hero.sub}</p>
        <div className="hero-cta-row">
          <MagneticButton href={hero.primaryCta.href} className="btn btn--solid">
            {hero.primaryCta.label}
          </MagneticButton>
          <MagneticButton href={hero.secondaryCta.href} className="btn btn--ghost">
            {hero.secondaryCta.label}
          </MagneticButton>
        </div>
        <div className="hero-stats">
          {hero.stats.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Pins itself in the viewport (the screen holds still) while its slide
 * children cross-fade/rotate through, scrubbed to scroll position - each
 * slide gets a randomized axis/angle/direction on every mount so no two
 * transitions look identical.
 */
export default function PinnedStage({ children, className }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    const items = itemRefs.current.filter(Boolean);
    if (!stage || items.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      items.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 }));
      return;
    }

    const randoms = items.map(() => {
      const axis: "rotateX" | "rotateY" = Math.random() > 0.5 ? "rotateX" : "rotateY";
      const sign = Math.random() > 0.5 ? 1 : -1;
      const angle = (Math.random() * 18 + 22) * sign;
      const offset = (Math.random() * 50 + 30) * sign;
      return { axis, angle, offset };
    });

    items.forEach((el, i) => {
      const r = randoms[i];
      gsap.set(el, {
        autoAlpha: i === 0 ? 1 : 0,
        [r.axis]: i === 0 ? 0 : r.angle,
        x: i !== 0 && r.axis === "rotateY" ? r.offset : 0,
        y: i !== 0 && r.axis === "rotateX" ? r.offset : 0,
        filter: i === 0 ? "blur(0px)" : "blur(10px)",
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "+=" + items.length * 100 + "%",
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    });

    items.forEach((el, i) => {
      if (i === 0) return;
      const prev = items[i - 1];
      const prevExitAxis = randoms[i - 1].axis;
      const prevExitSign = randoms[i - 1].angle > 0 ? -1 : 1;
      const r = randoms[i];
      const at = i - 1;

      tl.to(
        prev,
        {
          autoAlpha: 0,
          filter: "blur(10px)",
          [prevExitAxis]: 16 * prevExitSign,
          duration: 1,
          ease: "none",
        },
        at
      ).fromTo(
        el,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          [r.axis]: 0,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "none",
        },
        at
      );
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const slides = Children.toArray(children);

  return (
    <div ref={stageRef} className={className}>
      {slides.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) itemRefs.current[i] = el;
          }}
          className="pinned-stage__slide"
        >
          {child}
        </div>
      ))}
    </div>
  );
}

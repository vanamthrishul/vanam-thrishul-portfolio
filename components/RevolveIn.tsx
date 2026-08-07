"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: ReactNode;
  className?: string;
  axis?: "x" | "y";
  delay?: number;
};

/**
 * Wraps content that tilts and rotates into place as it enters the
 * viewport, scrubbed to scroll position (not a one-shot trigger) —
 * the "revolving in through the clouds" motion signature for the site.
 * Requires an ancestor with `perspective` set (see `.reveal-perspective`).
 * Needs real scroll room below the element to fully resolve — avoid
 * placing it on the last item of a viewport-centered section with no
 * following content, or it can stall mid-reveal once scrolling maxes out.
 */
export default function RevolveIn({ children, className, axis = "x", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, { clearProps: "all" });
      return;
    }

    const from =
      axis === "x"
        ? { rotateX: -22, y: 70, z: -160, opacity: 0, filter: "blur(8px)" }
        : { rotateY: 22, x: 60, z: -160, opacity: 0, filter: "blur(8px)" };

    gsap.set(el, from);
    const tween = gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      z: 0,
      opacity: 1,
      filter: "blur(0px)",
      ease: "none",
      delay,
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
        end: "top 60%",
        scrub: 0.8,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [axis, delay]);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}

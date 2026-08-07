"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Preloader() {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 100 : 0));
  const [done, setDone] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const start = performance.now();
    const duration = 1400;
    let raf = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 250);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="preloader__count">{progress}%</span>
          <div className="preloader__bar">
            <div className="preloader__bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect } from "react";
import Lenis from "lenis";

/** The live Lenis instance, or null under reduced motion / before mount.
 *
 * Module-scoped rather than context because the only other consumer is the
 * section nav, which needs to *drive* the scroll: Lenis owns the document
 * scroll position, so a native `scrollIntoView` would fight it mid-animation
 * and land somewhere between the two. */
let lenisInstance: Lenis | null = null;

/** Scrolls to an element through Lenis when it's running, natively otherwise
 * (reduced motion, or before the effect has mounted). */
export function scrollToElement(el: HTMLElement) {
  if (lenisInstance) {
    // Matches the sections' CSS `scroll-margin-top`, which Lenis does not read.
    const offset = window.innerWidth <= 720 ? -132 : -148;
    lenisInstance.scrollTo(el, { offset });
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** App-wide inertial scrolling.
 *
 * Lives in PageLayout so the feel is identical everywhere. Lenis drives the
 * real document scroll, so native `scroll` events still fire and GSAP's
 * ScrollTrigger needs no bridging.
 *
 * Driven by its own rAF loop rather than `gsap.ticker` so the two stay
 * independent. */
export function useSmoothScroll() {
  useEffect(() => {
    // Inertia is exactly the effect someone with vestibular sensitivity turns
    // this setting off to avoid — leave the native scroll alone.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });
    lenisInstance = lenis;

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

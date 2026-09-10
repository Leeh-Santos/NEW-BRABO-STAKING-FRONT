import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import Typed from "typed.js";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Entrance + scroll-reveal choreography for the staking page.
 *
 * Deliberately unscoped (no gsap.context `scope`): `.navbar` and `.page-nav`
 * live in PageLayout, outside this page's own DOM subtree, so a scoped selector
 * would never find them. Safe here because this app renders exactly one page —
 * there is no other route whose `.stat-card`s could be present at the same time.
 *
 * Which sections animate is a judgement about this page, not a copy of Brabo's
 * Fund-page scope: every section below the fold gets a scroll reveal, because
 * on a single-page product the whole page *is* the scroll. */
export function useStakingPageAnimations(subtitleText: string) {
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    // Every tween below starts from `autoAlpha: 0`. Under reduced motion we must
    // not set that hidden state at all — skipping only the `.to()` calls would
    // leave the whole page invisible.
    if (prefersReducedMotion()) return;

    gsap.set(".navbar", { autoAlpha: 0, y: -20 });
    gsap.set(".ticker", { autoAlpha: 0, y: -12 });
    gsap.set(".page-nav", { autoAlpha: 0, y: -12 });

    // Cells in shared-edge grids fade only, never translate: the 1px gap *is*
    // the divider, so moving a cell drags it off its rule and briefly exposes
    // the line underneath. The choreography lives in the stagger instead.
    gsap.set(".stat-card", { autoAlpha: 0 });
    gsap.set(".panel", { autoAlpha: 0 });
    gsap.set(".tier-card", { autoAlpha: 0 });
    gsap.set(".step-card", { autoAlpha: 0 });
    gsap.set(".contract-card", { autoAlpha: 0 });

    gsap.to([".navbar", ".ticker", ".page-nav"], {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.06,
      delay: 0.05,
    });

    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 });
    heroTl
      .from(".hero-eyebrow", { y: 12, autoAlpha: 0, duration: 0.45 }, 0)
      .from(".hero-title", { y: 24, autoAlpha: 0, duration: 0.7 }, 0.05)
      .from(".hero-subtitle", { y: 12, autoAlpha: 0, duration: 0.5 }, 0.25)
      .from(".hero-note", { y: 10, autoAlpha: 0, duration: 0.45 }, 0.35);

    const reveal = (targets: string, trigger: string, stagger = 0.06) =>
      gsap.to(targets, {
        scrollTrigger: { trigger, start: "top 88%", once: true },
        autoAlpha: 1,
        duration: 0.45,
        stagger,
        ease: "power2.out",
      });

    reveal(".stat-card", ".stats-section", 0.05);
    reveal(".panel", ".actions-section", 0.08);
    reveal(".tier-card", ".tiers-section", 0.07);
    reveal(".step-card", ".how-it-works", 0.07);
    reveal(".contract-card", ".contracts-section", 0.07);
  }, []);

  useEffect(() => {
    const el = subtitleRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = subtitleText;
      return;
    }

    // Read from the `subtitleText` param, not the live DOM: React StrictMode
    // double-invokes this effect in dev (mount → cleanup → mount again against
    // the same node), and reading `el.textContent` would capture whatever the
    // first pass already cleared it to.
    el.textContent = "";
    let typed: Typed | undefined;

    const timer = setTimeout(() => {
      typed = new Typed(el, {
        strings: [subtitleText],
        typeSpeed: 26,
        showCursor: true,
        cursorChar: "_",
        onComplete: (self) => {
          setTimeout(() => {
            if (self.cursor) self.cursor.style.display = "none";
          }, 1500);
        },
      });
    }, 800);

    return () => {
      clearTimeout(timer);
      typed?.destroy();
    };
  }, [subtitleText]);

  return { subtitleRef };
}

import { useEffect, useState } from "react";
import { scrollToElement } from "../../hooks/useSmoothScroll";

/** Brabo Markets puts five routes in this bar. Brabo Staking is one page, so
 * the same bar carries section anchors instead — the shell silhouette is part
 * of the ecosystem's identity, but tabs that navigate nowhere would not be.
 * Each id below is a real section element on the page. */
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "stake", label: "Stake" },
  { id: "tiers", label: "Tiers" },
  { id: "how-it-works", label: "How It Works" },
  { id: "contracts", label: "Contracts" },
] as const;

export function PageNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    // The band runs from just under the sticky header down to 45% of the
    // viewport. Whichever section overlaps it is the one being read, so the
    // underline tracks reading position rather than merely "is on screen".
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-150px 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="page-nav" aria-label="Page sections">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`page-nav-tab${active === section.id ? " active" : ""}`}
          aria-current={active === section.id ? "true" : undefined}
          onClick={() => {
            const el = document.getElementById(section.id);
            if (el) scrollToElement(el);
          }}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}

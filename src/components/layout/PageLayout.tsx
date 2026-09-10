import type { ReactNode } from "react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";
import { AccrualField } from "../ui/AccrualField";
import { Navbar } from "./Navbar";
import { PageNav } from "./PageNav";
import { Ticker } from "./Ticker";

export function PageLayout({ children }: { children: ReactNode }) {
  useSmoothScroll();

  return (
    <>
      {/* Static ground and ruled grid (CSS), then the live accrual field
          (canvas) on top of it. Both sit at z-index -1, behind all content. */}
      <div className="ambient" aria-hidden="true">
        <div className="ambient-grid" />
        <div className="ambient-vignette" />
      </div>
      <AccrualField />

      <Navbar />
      <Ticker />
      <PageNav />
      <main className="main-container">{children}</main>
    </>
  );
}

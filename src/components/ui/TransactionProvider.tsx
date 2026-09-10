import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface TransactionContextValue {
  /** True while any write is in flight — drives the full-screen overlay. */
  isBusy: boolean;
  /** Runs a write with the overlay up, guaranteeing it comes down again. */
  run: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

/** Owns the single page-wide "Processing transaction..." overlay.
 *
 * Legacy-site called `showLoading()`/`hideLoading()` by hand at the top and bottom of
 * every handler, which meant an early `return` (or a throw on a path without a
 * `try/catch`) left the overlay stuck over a dead page. Wrapping the call in `run`
 * puts the `finally` in exactly one place instead of five. */
export function TransactionProvider({ children }: { children: ReactNode }) {
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setIsBusy(true);
    try {
      return await fn();
    } finally {
      setIsBusy(false);
    }
  }, []);

  return (
    <TransactionContext.Provider value={{ isBusy, run }}>
      {children}
      <div className={`loading-overlay ${isBusy ? "active" : ""}`} aria-hidden={!isBusy}>
        <div className="loading-spinner" />
        <p className="loading-text">Processing transaction...</p>
      </div>
    </TransactionContext.Provider>
  );
}

export function useTransactionRunner() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactionRunner must be used within a TransactionProvider");
  return ctx;
}

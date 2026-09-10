import { WalletButton } from "./WalletButton";

export function Navbar() {
  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#top" aria-label="Brabo Staking — top of page">
        {/* Explicit width/height + eager/high priority: this is the first brand
            element on screen and must not reflow the header when it lands.
            This is the ecosystem's framed bull mark (1.5 KB) rather than the
            glow-on-black variant the old header used, which was a 1.29 MB PNG
            being painted at 32 px. */}
        <img
          src="/brand/brabo-bull-64.png"
          className="navbar-logo"
          width={32}
          height={32}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <span className="navbar-wordmark">
          <span className="navbar-title">Brabo Staking</span>
          <span className="navbar-tagline">$BRB · Base</span>
        </span>
      </a>
      <WalletButton />
    </nav>
  );
}

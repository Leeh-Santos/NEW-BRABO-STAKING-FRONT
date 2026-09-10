import { ContractsSection } from "../components/contracts/ContractsSection";
import { HowItWorks } from "../components/info/HowItWorks";
import { TierBenefits } from "../components/info/TierBenefits";
import { RewardsCard } from "../components/staking/RewardsCard";
import { StakeCard } from "../components/staking/StakeCard";
import { UnstakeCard } from "../components/staking/UnstakeCard";
import { StatsGrid } from "../components/stats/StatsGrid";
import { useStakingActions } from "../hooks/useStakingActions";
import { useStakingData } from "../hooks/useStakingData";
import { useStakingPageAnimations } from "../hooks/useStakingPageAnimations";

const HERO_SUBTITLE = "Earn up to 30% APR with NFT tier bonuses. Claim anytime, no lock-up.";

export function StakingPage() {
  const data = useStakingData();
  const { stake, claimRewards, unstake, isBusy } = useStakingActions({
    tokenDecimals: data.tokenDecimals,
    onSuccess: data.refetchAll,
  });
  const { subtitleRef } = useStakingPageAnimations(HERO_SUBTITLE);

  return (
    <div className="page-content" id="top">
      <section className="hero-section">
        {/* The mascot watching, cropped by the viewport rather than framed.
            Not lazy: it sits in the first viewport, and `loading="lazy"` on
            above-the-fold content defers the request until after layout.
            `fetchPriority="low"` keeps it from competing with the headline —
            it yields, rather than starting late. */}
        <img
          src="/brand/brabo-bull-512.png"
          className="hero-bull"
          alt=""
          aria-hidden="true"
          fetchPriority="low"
          decoding="async"
        />
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="dot" aria-hidden="true" />
            Live on Base
          </span>
          <h1 className="hero-title">
            Stake $BRB, <span className="accent">earn</span> rewards
          </h1>
          {/* aria-hidden + a static sibling: the typewriter mutates this node one
              character at a time, which a screen reader would announce as a
              stream of fragments. */}
          <p ref={subtitleRef} className="hero-subtitle" aria-hidden="true">
            {HERO_SUBTITLE}
          </p>
          <p className="sr-only">{HERO_SUBTITLE}</p>
          <p className="hero-note">
            {"Need $BRB? Get it on "}
            <a href="https://brabomarkets.com" target="_blank" rel="noopener noreferrer">
              brabomarkets.com
            </a>
            {" or Uniswap."}
          </p>
        </div>
      </section>

      <section className="stats-section" id="overview">
        <StatsGrid data={data} />
      </section>

      <section className="actions-section" id="stake">
        <h2 className="section-title">Your Position</h2>
        <div className="cards-grid">
          <StakeCard data={data} onStake={stake} isBusy={isBusy} />
          <RewardsCard data={data} onClaim={claimRewards} isBusy={isBusy} />
          <UnstakeCard data={data} onUnstake={unstake} isBusy={isBusy} />
        </div>
      </section>

      <TierBenefits tier={data.tier} isConnected={data.isConnected} />
      <HowItWorks />
      <ContractsSection />
    </div>
  );
}

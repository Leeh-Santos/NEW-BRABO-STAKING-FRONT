import type { TierName } from "../../hooks/useStakingData";
import { TIER_ART } from "../../lib/tierArt";

/** The numbers mirror BraboStaking.sol's BRONZE/SILVER/GOLD_BOOST constants
 * (+2/+5/+10 over the 20% base) and NftBrabo.upgradeTierBasedOnFunding's USD
 * thresholds — unchanged from the previous build, only restyled. */
const TIERS = [
  { key: "Bronze", apr: "22% APR", bonus: "+2% boost", requirement: "Fund $5+ USD", art: TIER_ART.bronze },
  { key: "Silver", apr: "25% APR", bonus: "+5% boost", requirement: "Fund $50+ USD", art: TIER_ART.silver },
  { key: "Gold", apr: "30% APR", bonus: "+10% boost", requirement: "Fund $100+ USD", art: TIER_ART.gold },
] as const;

/** Rank order for "have I reached this tier yet". Mirrors NftBrabo's MOOD enum
 * (0 Bronze, 1 Silver, 2 Gold); "No NFT" sits below all of them. */
const RANK: Record<TierName, number> = { "No NFT": -1, Bronze: 0, Silver: 1, Gold: 2 };

export function TierBenefits({ tier, isConnected }: { tier: TierName; isConnected: boolean }) {
  const userRank = isConnected ? RANK[tier] : -1;

  return (
    <section className="tiers-section" id="tiers">
      <h2 className="section-title">NFT Tier Benefits</h2>
      <p className="section-lede">
        Holding a Brabo tier NFT raises your staking APR above the 20% base rate. Tiers are earned
        by funding on Brabo Markets and apply automatically to your stake.
      </p>
      <div className="tier-cards-grid">
        {TIERS.map((t, index) => {
          // Locked tiers stay visible and desaturated — you should be able to
          // see what you're working toward.
          const unlocked = userRank >= index;
          return (
            <div key={t.key} className={`tier-card${unlocked ? " unlocked" : ""}`}>
              {/* Decorative: the tier name sits right beside it in text. */}
              <img src={t.art} className="tier-icon" alt="" width={56} height={56} loading="lazy" />
              <span className="tier-name">{t.key} Tier</span>
              <span className="tier-apr">{t.apr}</span>
              <span className="tier-threshold">
                {t.bonus} · {t.requirement}
              </span>
              <span className="tier-status">{unlocked ? "Unlocked" : "Locked"}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

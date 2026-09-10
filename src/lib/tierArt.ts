import type { TierName } from "../hooks/useStakingData";

/** The tier medallions. Byte-identical artwork to Brabo Markets' — the two
 * products mint against the same NftBrabo contract, so the tiers are literally
 * the same objects and must not drift visually. */
export const TIER_ART = {
  bronze: "/info/bronze.svg",
  silver: "/info/silver.svg",
  gold: "/info/gold.svg",
} as const;

/** Art for a tier name as the staking contract reports it, or undefined for
 * "No NFT" — there is nothing to show for a tier that hasn't been minted. */
export function tierArt(tier: TierName): string | undefined {
  switch (tier) {
    case "Bronze":
      return TIER_ART.bronze;
    case "Silver":
      return TIER_ART.silver;
    case "Gold":
      return TIER_ART.gold;
    default:
      return undefined;
  }
}

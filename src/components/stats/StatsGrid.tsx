import { formatUnits } from "viem";
import type { useStakingData } from "../../hooks/useStakingData";
import { formatTokenAmount } from "../../lib/formatters";
import { tierArt } from "../../lib/tierArt";
import { StatCard } from "../ui/StatCard";

/** Wei -> plain number, for the counters. */
const toNumber = (v: bigint | undefined, decimals: number) =>
  v === undefined ? 0 : parseFloat(formatUnits(v, decimals));

/** The six protocol/user figures.
 *
 * Six cells, because the grid's column counts (3 / 2 / 1) all divide six — see
 * the note on `.stats-grid` in index.css. The contract links that used to ride
 * along as a seventh cell now have their own section, which is both what the
 * design system does with contract cards and what keeps this grid at six.
 *
 * Per-user figures fall back to their zero state with no wallet connected,
 * exactly as before; the two protocol-wide figures stay populated either way. */
export function StatsGrid({ data }: { data: ReturnType<typeof useStakingData> }) {
  const { tokenDecimals, isConnected, isUserLoading } = data;

  return (
    <div className="stats-grid">
      <StatCard
        label="Your Staked"
        value={formatTokenAmount(data.stakedAmount, tokenDecimals)}
        unit="$BRB"
        loading={isUserLoading}
        countUp={{ end: toNumber(data.stakedAmount, tokenDecimals), decimals: 2 }}
      />
      <StatCard
        label="Pending Rewards"
        value={formatTokenAmount(data.pendingRewards, tokenDecimals)}
        unit="$BRB"
        loading={isUserLoading}
        countUp={{ end: toNumber(data.pendingRewards, tokenDecimals), decimals: 2 }}
      />
      <StatCard
        label="Your APR"
        value={String(data.effectiveApr)}
        unit="%"
        loading={isUserLoading}
        countUp={{ end: data.effectiveApr, decimals: 0 }}
        subValue={data.nftBoost > 0 ? `+${data.nftBoost}% NFT Boost` : "Base Rate"}
        subValueTone={data.nftBoost > 0 ? "earned" : "muted"}
      />
      <StatCard
        label="Your Tier"
        value={data.tier}
        loading={isUserLoading}
        icon={isConnected ? tierArt(data.tier) : undefined}
      />
      <StatCard
        label="Total Stakers"
        value={data.totalStakers !== undefined ? String(data.totalStakers) : "0"}
        loading={data.totalStakers === undefined}
        countUp={{ end: data.totalStakers ?? 0, decimals: 0 }}
      />
      <StatCard
        label="Total Staked"
        value={formatTokenAmount(data.totalStaked, tokenDecimals)}
        unit="$BRB"
        loading={data.totalStaked === undefined}
        countUp={{ end: toNumber(data.totalStaked, tokenDecimals), decimals: 2 }}
      />
    </div>
  );
}

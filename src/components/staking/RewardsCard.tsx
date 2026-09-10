import type { useStakingData } from "../../hooks/useStakingData";
import { formatTokenAmount } from "../../lib/formatters";
import { tierArt } from "../../lib/tierArt";

interface Props {
  data: ReturnType<typeof useStakingData>;
  onClaim: () => void;
  isBusy: boolean;
}

export function RewardsCard({ data, onClaim, isBusy }: Props) {
  const { pendingRewards, tokenDecimals, effectiveApr, nftBoost, tier, isConnected } = data;
  const art = isConnected ? tierArt(tier) : undefined;

  // Compare the raw bigint: a sub-0.005 reward rounds to "0.00" for display but
  // is still claimable, and a float check on the rounded string would disable
  // the button on exactly that case.
  const hasRewards = pendingRewards !== undefined && pendingRewards > 0n;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Your Rewards</h3>
        <div className="panel-meta">
          Tier
          <span className="panel-meta-value">{tier}</span>
          {art && (
            <img src={art} className="nft-medallion" alt="" width={18} height={18} loading="lazy" />
          )}
        </div>
      </div>

      <div className="rewards-display">
        <span className="rewards-label">Available to claim</span>
        <div className="rewards-value">
          <span className="rewards-amount">
            {formatTokenAmount(pendingRewards, tokenDecimals)}
          </span>
          <span className="rewards-unit">$BRB</span>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Your APR</span>
          <span className="info-value is-accent">{effectiveApr}%</span>
        </div>
        <div className="info-item">
          <span className="info-label">NFT boost</span>
          <span className={`info-value${nftBoost > 0 ? " is-earned" : ""}`}>+{nftBoost}%</span>
        </div>
      </div>

      <button
        type="button"
        className="action-btn"
        disabled={!isConnected || !hasRewards || isBusy}
        onClick={onClaim}
      >
        {isBusy ? "Processing…" : "Claim Rewards"}
      </button>

      <p className="card-notice success">Claim anytime without unstaking</p>
    </div>
  );
}

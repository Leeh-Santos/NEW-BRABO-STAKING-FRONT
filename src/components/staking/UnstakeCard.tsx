import { useState } from "react";
import type { useStakingData } from "../../hooks/useStakingData";
import { formatNumber, formatTokenAmount, toInputValue } from "../../lib/formatters";

interface Props {
  data: ReturnType<typeof useStakingData>;
  onUnstake: () => void;
  isBusy: boolean;
}

export function UnstakeCard({ data, onUnstake, isBusy }: Props) {
  const [amount, setAmount] = useState("");
  const { stakedAmount, pendingRewards, tokenDecimals, isConnected } = data;

  const hasStake = stakedAmount !== undefined && stakedAmount > 0n;
  const parsed = parseFloat(amount);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Unstake $BRB</h3>
        <div className="panel-meta">
          Staked
          <span className="panel-meta-value">
            {formatTokenAmount(stakedAmount, tokenDecimals)} $BRB
          </span>
        </div>
      </div>

      <label className="input-label" htmlFor="unstakeInput">
        Amount to unstake
      </label>
      <div className="input-wrapper">
        {/* Display-only, as on the previous build: BraboStaking.unstake() takes
            no argument and always withdraws the full position plus rewards, so
            this field feeds the "You will receive" preview and nothing else.
            Worth revisiting with product — an input that cannot change the
            outcome is a usability trap, not a feature. */}
        <input
          id="unstakeInput"
          type="number"
          className="token-input"
          placeholder="0.0"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          type="button"
          className="max-btn"
          onClick={() => setAmount(toInputValue(stakedAmount, tokenDecimals))}
        >
          MAX
        </button>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">You will receive</span>
          <span className="info-value">
            {Number.isFinite(parsed) && parsed > 0 ? formatNumber(parsed) : "0.00"} $BRB
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">+ Pending rewards</span>
          <span className="info-value">
            {formatTokenAmount(pendingRewards, tokenDecimals)} $BRB
          </span>
        </div>
      </div>

      {/* Outlined, not filled: the exit path should not compete with staking. */}
      <button
        type="button"
        className="action-btn is-exit"
        disabled={!isConnected || !hasStake || isBusy}
        onClick={() => {
          onUnstake();
          setAmount("");
        }}
      >
        {isBusy ? "Processing…" : "Unstake All + Claim"}
      </button>

      <p className="card-notice warning">Unstaking withdraws all stake + rewards</p>
    </div>
  );
}

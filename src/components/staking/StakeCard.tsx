import { useState } from "react";
import { parseUnits } from "viem";
import type { useStakingData } from "../../hooks/useStakingData";
import { formatNumber, formatTokenAmount, toInputValue } from "../../lib/formatters";

interface Props {
  data: ReturnType<typeof useStakingData>;
  onStake: (amount: string) => void;
  isBusy: boolean;
}

export function StakeCard({ data, onStake, isBusy }: Props) {
  const [amount, setAmount] = useState("");
  const { balance, tokenDecimals, effectiveApr, isConnected } = data;

  const parsed = parseFloat(amount);
  const hasAmount = Number.isFinite(parsed) && parsed > 0;

  // Compare in wei, not in floats: the displayed balance is rounded to 2dp, so a
  // float comparison against it rejected a legitimate "stake exactly my balance".
  // An unknown balance (no wallet, read still in flight) counts as zero.
  let exceedsBalance = false;
  if (hasAmount) {
    try {
      exceedsBalance = parseUnits(amount, tokenDecimals) > (balance ?? 0n);
    } catch {
      // Unparseable input (e.g. "1.2.3") — treated as "no amount" below.
    }
  }

  const canStake = isConnected && hasAmount && !exceedsBalance && !isBusy;

  const buttonText = !hasAmount
    ? "Enter Amount"
    : exceedsBalance
      ? "Insufficient Balance"
      : isBusy
        ? "Processing…"
        : "Stake $BRB";

  // amount * (apr / 365 / 100). Shown to 4dp once there's an amount to project;
  // the resting state stays at 2dp so the panel doesn't open on a noisy figure.
  const hasProjection = hasAmount && !exceedsBalance;
  const dailyEarnings = hasProjection ? parsed * (effectiveApr / 365 / 100) : 0;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Stake $BRB</h3>
        <div className="panel-meta">
          Balance
          <span className="panel-meta-value">
            {formatTokenAmount(balance, tokenDecimals)} $BRB
          </span>
        </div>
      </div>

      <label className="input-label" htmlFor="stakeInput">
        Amount to stake
      </label>
      <div className="input-wrapper">
        <input
          id="stakeInput"
          type="number"
          className="token-input"
          placeholder="0.0"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {/* Fills from the exact wei balance — reading it back out of the 2dp
            display string would silently leave dust behind. */}
        <button
          type="button"
          className="max-btn"
          onClick={() => setAmount(toInputValue(balance, tokenDecimals))}
        >
          MAX
        </button>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">You will earn</span>
          <span className="info-value is-accent">{effectiveApr}% APR</span>
        </div>
        <div className="info-item">
          <span className="info-label">Estimated daily</span>
          <span className="info-value">
            {hasProjection ? formatNumber(dailyEarnings, 4) : "0.00"} $BRB
          </span>
        </div>
      </div>

      <button
        type="button"
        className="action-btn"
        disabled={!canStake}
        onClick={() => {
          onStake(amount);
          setAmount("");
        }}
      >
        {buttonText}
      </button>

      <p className="card-notice">Rewards accrue every second based on your APR</p>
    </div>
  );
}

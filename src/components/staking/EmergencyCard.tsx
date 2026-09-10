import type { useStakingData } from "../../hooks/useStakingData";

interface Props {
  data: ReturnType<typeof useStakingData>;
  onEmergencyWithdraw: () => void;
  isBusy: boolean;
}

/** Emergency withdrawal — returns principal, forfeits all accrued rewards.
 *
 * NOT MOUNTED, deliberately. The legacy vanilla site carried a full
 * `handleEmergencyWithdraw` handler and `.emergency-*` styles, but its
 * index.html never rendered the button, so the path was unreachable in
 * production. That parity is kept here; the port stays done, so mounting
 * <EmergencyCard /> in StakingPage is all it takes to expose it. The write
 * itself is already wired in useStakingActions. */
export function EmergencyCard({ data, onEmergencyWithdraw, isBusy }: Props) {
  const hasStake = data.stakedAmount !== undefined && data.stakedAmount > 0n;

  return (
    <section className="contracts-section">
      <h2 className="section-title">Emergency Withdraw</h2>
      <div className="contracts-grid">
        <div className="contract-card">
          <h4 className="contract-name">Withdraw principal only</h4>
          <p className="contract-description">
            Returns your staked $BRB immediately and forfeits every pending reward. Only use this
            if you need your principal back urgently.
          </p>
          <button
            type="button"
            className="action-btn is-exit"
            disabled={!data.isConnected || !hasStake || isBusy}
            onClick={() => {
              const confirmed = window.confirm(
                "WARNING: Emergency withdraw will forfeit ALL pending rewards. Only your staked $BRB will be returned. Are you sure you want to continue?",
              );
              if (confirmed) onEmergencyWithdraw();
            }}
          >
            {isBusy ? "Processing…" : "Emergency Withdraw"}
          </button>
        </div>
      </div>
    </section>
  );
}

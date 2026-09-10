import { useStakingData } from "../../hooks/useStakingData";
import { formatTokenAmount } from "../../lib/formatters";

/** The live tape.
 *
 * Every figure on it is already fetched for the stats grid — this calls the
 * same hook, and wagmi/react-query dedupe on the query key, so the tape costs
 * no extra RPC calls and adds no new contract reads. It just puts the
 * protocol's numbers where a trading product puts them.
 *
 * The row is duplicated and the track translated by exactly -50%, which is what
 * makes the loop seamless; `aria-hidden` on the copy stops a screen reader
 * announcing every figure twice. */
export function Ticker() {
  const {
    totalStaked,
    totalStakers,
    baseApr,
    effectiveApr,
    stakedAmount,
    pendingRewards,
    tier,
    tokenDecimals,
    isConnected,
  } = useStakingData();

  const dash = "—";

  const items: Array<{ label: string; value: string }> = [
    { label: "BRB STAKED", value: formatTokenAmount(totalStaked, tokenDecimals) },
    { label: "STAKERS", value: totalStakers?.toString() ?? dash },
    { label: "BASE APR", value: `${baseApr}%` },
    { label: "YOUR APR", value: isConnected ? `${effectiveApr}%` : dash },
    {
      label: "YOUR STAKE",
      value: isConnected ? formatTokenAmount(stakedAmount, tokenDecimals) : dash,
    },
    {
      label: "PENDING",
      value: isConnected ? formatTokenAmount(pendingRewards, tokenDecimals) : dash,
    },
    { label: "TIER", value: isConnected ? tier : dash },
  ];

  const row = (copy: boolean) => (
    <div className="ticker-row" aria-hidden={copy || undefined}>
      {items.map((item) => (
        <span className="ticker-item" key={`${copy ? "b" : "a"}-${item.label}`}>
          <span className="ticker-key">{item.label}</span>
          <span className="ticker-val">{item.value}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker">
      <span className="ticker-badge">LIVE · BASE</span>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

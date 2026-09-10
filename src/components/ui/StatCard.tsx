import { CountUp } from "../../lib/countup";

interface StatCardProps {
  label: string;
  /** Rendered when `countUp` is absent, or as the pre-animation fallback. */
  value: string;
  /** Trailing unit beside the figure ("$BRB", "%"). Kept out of `countUp` so the
   * counter only ever animates the number itself. */
  unit?: string;
  subValue?: string;
  /** Gold marks a bonus the user has earned. Never used for an action. */
  subValueTone?: "muted" | "earned";
  /** Renders a shimmer in place of the value. A stat showing "--" while its
   * contract read is in flight reads as broken data rather than as pending. */
  loading?: boolean;
  /** Optional leading artwork (an NFT tier medallion). Decorative — the value
   * beside it already names the tier. */
  icon?: string;
  /** Animates the figure on change. */
  countUp?: { end: number; decimals?: number; prefix?: string };
}

export function StatCard({
  label,
  value,
  unit,
  subValue,
  subValueTone = "muted",
  loading,
  icon,
  countUp,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {icon && !loading && (
          <img src={icon} className="stat-icon" alt="" width={28} height={28} loading="lazy" />
        )}
        {loading ? (
          <span className="skeleton" aria-label={`${label} loading`} />
        ) : countUp ? (
          <CountUp
            end={countUp.end}
            decimals={countUp.decimals ?? 2}
            duration={2}
            separator=","
            prefix={countUp.prefix}
            useEasing
            preserveValue
          />
        ) : (
          value
        )}
        {unit && !loading && <span className="stat-unit">{unit}</span>}
      </div>
      {subValue && !loading && (
        <div className={`stat-subvalue${subValueTone === "earned" ? " is-boosted" : ""}`}>
          {subValue}
        </div>
      )}
    </div>
  );
}

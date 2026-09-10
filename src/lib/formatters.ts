import { formatUnits } from "viem";

/** Mirrors legacy-site/staking.js `formatNumber` — en-US grouping, fixed decimals. */
export function formatNumber(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!num || Number.isNaN(num)) return (0).toFixed(decimals);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Wei -> grouped display string, e.g. 1234567890000000000000n -> "1,234.57". */
export function formatTokenAmount(amount: bigint | undefined, tokenDecimals = 18, decimals = 2): string {
  if (amount === undefined) return (0).toFixed(decimals);
  return formatNumber(formatUnits(amount, tokenDecimals), decimals);
}

/** Wei -> plain unformatted decimal string, for putting into a number input.
 * Grouping separators would make the value unparseable by `parseUnits`. */
export function toInputValue(amount: bigint | undefined, tokenDecimals = 18): string {
  if (amount === undefined) return "";
  return formatUnits(amount, tokenDecimals);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

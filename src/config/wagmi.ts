import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { base } from "wagmi/chains";
import { env } from "./env";

/** Base mainnet only — the legacy site hard-switched the wallet to chain 8453 on
 * connect (wallet_connect.js `connect`/`addNetwork`). Declaring a single chain here
 * gets the same effect through RainbowKit: any other network shows as "Wrong network"
 * with a one-click switch, instead of the app silently reading the wrong chain.
 *
 * The `http(baseRpcUrl)` transport also gives us wallet-free reads, which is what
 * powers the global stats on first paint (legacy did this with a standalone
 * ethers JsonRpcProvider in its DOMContentLoaded handler). */
export const wagmiConfig = getDefaultConfig({
  appName: "Brabo Staking",
  projectId: env.walletConnectProjectId,
  chains: [base],
  transports: {
    [base.id]: http(env.baseRpcUrl),
  },
  ssr: false,
});

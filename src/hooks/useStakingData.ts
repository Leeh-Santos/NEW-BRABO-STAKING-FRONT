import { useAccount, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESSES, ERC20_ABI, STAKING_ABI } from "../config/contracts";

const stakingContract = { address: CONTRACT_ADDRESSES.STAKING, abi: STAKING_ABI } as const;
const tokenContract = { address: CONTRACT_ADDRESSES.BRB_TOKEN, abi: ERC20_ABI } as const;

/** Legacy-site polled every 10s (`setInterval(updateAllData, 10000)`); rewards accrue
 * per second on-chain, so the displayed figure steps rather than ticks. Kept identical. */
const POLL_MS = 10_000;

export type TierName = "Gold" | "Silver" | "Bronze" | "No NFT";

/** Every read the staking page needs.
 *
 * Split into two batches because they have different lifetimes: the protocol-wide
 * numbers render before a wallet is ever connected (legacy-site did this with a
 * standalone read-only ethers provider), while the per-user numbers only exist once
 * an address is known. Each batch is one multicall, replacing the six sequential
 * `await contract.x()` round-trips the legacy script made on every tick. */
export function useStakingData() {
  const { address, isConnected } = useAccount();

  const { data: globalData, refetch: refetchGlobal } = useReadContracts({
    contracts: [
      { ...stakingContract, functionName: "totalStaked" },
      { ...stakingContract, functionName: "totalStakers" },
      { ...stakingContract, functionName: "BASE_APR" },
      { ...tokenContract, functionName: "decimals" },
    ],
    query: { refetchInterval: POLL_MS },
  });

  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useReadContracts({
    contracts: [
      { ...stakingContract, functionName: "getStakeInfo", args: address ? [address] : undefined },
      { ...tokenContract, functionName: "balanceOf", args: address ? [address] : undefined },
    ],
    query: { enabled: Boolean(address), refetchInterval: POLL_MS },
  });

  const [totalStaked, totalStakers, baseAprRaw, decimalsRaw] = globalData ?? [];
  const [stakeInfo, balance] = userData ?? [];

  // BASE_APR is a contract constant (20). The legacy script hard-coded that 20 in JS to
  // derive the NFT boost; reading it means a contract redeploy at a different base rate
  // can't silently desync the displayed boost.
  const baseApr = baseAprRaw?.result !== undefined ? Number(baseAprRaw.result) : 20;
  const tokenDecimals = decimalsRaw?.result !== undefined ? Number(decimalsRaw.result) : 18;

  // getStakeInfo returns (stakedAmount, pendingRewards, effectiveAPR, nftTier).
  const info = stakeInfo?.result as
    | readonly [bigint, bigint, bigint, string]
    | undefined;

  const stakedAmount = isConnected ? info?.[0] : undefined;
  const pendingRewards = isConnected ? info?.[1] : undefined;
  const effectiveApr = isConnected && info ? Number(info[2]) : baseApr;
  const tier = ((isConnected ? info?.[3] : undefined) ?? "No NFT") as TierName;

  return {
    isConnected,
    isUserLoading: Boolean(address) && isUserLoading,
    tokenDecimals,

    // Protocol-wide
    totalStaked: totalStaked?.result as bigint | undefined,
    // Legacy-site displayed the on-chain staker count padded by +50
    // (staking.js `updateGlobalStats`). Preserved so the number doesn't visibly drop
    // on launch day — flag to product if this vanity offset should go.
    totalStakers:
      totalStakers?.result !== undefined ? Number(totalStakers.result) + 50 : undefined,

    // Per-user
    stakedAmount,
    pendingRewards,
    balance: balance?.result as bigint | undefined,
    effectiveApr,
    baseApr,
    nftBoost: Math.max(0, effectiveApr - baseApr),
    tier,

    refetchAll: () => {
      void refetchGlobal();
      void refetchUser();
    },
  };
}

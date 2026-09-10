import { maxUint256, parseUnits } from "viem";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { useToast } from "../components/ui/ToastProvider";
import { useTransactionRunner } from "../components/ui/TransactionProvider";
import { CONTRACT_ADDRESSES, ERC20_ABI, STAKING_ABI } from "../config/contracts";
import { getFriendlyErrorMessage } from "../lib/errors";
import { formatNumber } from "../lib/formatters";

interface Options {
  tokenDecimals: number;
  /** Re-read chain state once a receipt lands. */
  onSuccess: () => void;
}

/** The four write paths of BraboStaking.sol, ported from legacy-site/staking.js.
 *
 * Each one runs inside the shared transaction runner (overlay up, overlay guaranteed
 * down) and reports through the shared toast, so the sequencing matches the legacy
 * handlers exactly — only the provider plumbing changed. */
export function useStakingActions({ tokenDecimals, onSuccess }: Options) {
  const config = useConfig();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { showToast } = useToast();
  const { run, isBusy } = useTransactionRunner();

  /** Wraps a write: awaits the receipt, refreshes, and turns any throw into a sentence. */
  const submit = (label: string, fn: () => Promise<void>) =>
    run(async () => {
      try {
        await fn();
        showToast(label, "success");
        onSuccess();
      } catch (error) {
        console.error("[staking]", label, error);
        showToast(getFriendlyErrorMessage(error), "error");
      }
    });

  const stake = (amount: string) =>
    submit(`Successfully staked ${formatNumber(amount)} $BRB!`, async () => {
      if (!address) throw new Error("Wallet not connected");
      const amountWei = parseUnits(amount, tokenDecimals);

      // Read the allowance fresh at click time rather than trusting the polled copy —
      // it may be up to 10s stale, and an under-approved stake reverts on transferFrom.
      const allowance = await readContract(config, {
        address: CONTRACT_ADDRESSES.BRB_TOKEN,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, CONTRACT_ADDRESSES.STAKING],
      });

      if ((allowance as bigint) < amountWei) {
        showToast("Approving $BRB tokens...", "success");
        // Infinite approval, as the legacy flow did — one approval per wallet, so
        // repeat stakes are a single transaction instead of two.
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.BRB_TOKEN,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.STAKING, maxUint256],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
        showToast("Approval successful! Now staking...", "success");
      }

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.STAKING,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [amountWei],
      });
      await waitForTransactionReceipt(config, { hash });
    });

  const claimRewards = () =>
    submit("Rewards claimed successfully!", async () => {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.STAKING,
        abi: STAKING_ABI,
        functionName: "claimRewards",
      });
      await waitForTransactionReceipt(config, { hash });
    });

  const unstake = () =>
    submit("Unstaked successfully! All rewards claimed.", async () => {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.STAKING,
        abi: STAKING_ABI,
        functionName: "unstake",
      });
      await waitForTransactionReceipt(config, { hash });
    });

  /** Forfeits all pending rewards and returns principal only.
   *
   * Wired but not rendered — the legacy site had this handler and its stylesheet
   * (`.emergency-card`), but no button in index.html, so the path was unreachable.
   * Kept at parity: mount <EmergencyCard /> in StakingPage to expose it. */
  const emergencyWithdraw = () =>
    submit("Emergency withdrawal successful. Rewards forfeited.", async () => {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.STAKING,
        abi: STAKING_ABI,
        functionName: "emergencyWithdraw",
      });
      await waitForTransactionReceipt(config, { hash });
    });

  return { stake, claimRewards, unstake, emergencyWithdraw, isBusy };
}

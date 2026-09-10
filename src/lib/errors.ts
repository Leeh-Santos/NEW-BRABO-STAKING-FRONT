import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";

/** Maps a thrown transaction error onto a human message.
 *
 * The legacy site did `error.reason || error.message` (staking.js `handleStake` et al),
 * which surfaced raw provider strings like "execution reverted: ..." — or, for a user
 * who simply closed the wallet popup, a wall of JSON-RPC text. viem gives us structured
 * error types instead, so each of BraboStaking.sol's custom errors gets a real sentence. */
const REVERT_MESSAGES: Record<string, string> = {
  Staking__NoStake: "You have no active stake",
  Staking__ZeroAmount: "Nothing to claim yet",
  Staking__Paused: "Staking is currently paused",
  Staking__TransferFailed: "Token transfer failed",
  Staking__NotOwner: "Only the contract owner can do that",
  Staking__InsufficientBalance: "Insufficient $BRB balance",
  Staking__InsufficientRewardPool: "Reward pool is empty — try again later",
  ReentrancyGuardReentrantCall: "Transaction blocked by reentrancy guard",
  // Raised by the token, not the staking contract, when the staking contract's own
  // $BRB balance can't cover a payout. Reachable today: rewards already paid out have
  // been drawn from staked principal, so the contract holds slightly less $BRB than
  // `totalStaked`, and a full unstake reverts here.
  ERC20InsufficientBalance:
    "The staking contract doesn't hold enough $BRB to cover this withdrawal right now. Please contact the team.",
};

export function getFriendlyErrorMessage(error: unknown, fallback = "Transaction failed"): string {
  if (error instanceof BaseError) {
    const rejection = error.walk((e) => e instanceof UserRejectedRequestError);
    if (rejection) return "Transaction rejected by user";

    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      if (name && REVERT_MESSAGES[name]) return REVERT_MESSAGES[name];
      return revert.shortMessage ?? fallback;
    }

    if (error.shortMessage?.toLowerCase().includes("insufficient funds")) {
      return "Insufficient ETH for gas";
    }

    return error.shortMessage ?? fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

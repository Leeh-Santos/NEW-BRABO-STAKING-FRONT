import { useState } from "react";
import { CONTRACT_ADDRESSES } from "../../config/contracts";

const BASESCAN = "https://basescan.org/address";

const CONTRACTS = [
  {
    name: "Staking Protocol",
    address: CONTRACT_ADDRESSES.STAKING,
    description:
      "Holds staked $BRB, accrues rewards per second against your effective APR, and pays out on claim or unstake.",
  },
  {
    name: "$BRB Token",
    address: CONTRACT_ADDRESSES.BRB_TOKEN,
    description: "The ERC-20 staked by this protocol and paid out as rewards.",
  },
] as const;

/** Contract links, previously a seventh cell riding along in the stats grid.
 *
 * Addresses come from the same config the app reads with, so a redeploy can't
 * leave the links pointing at the old contract. */
export function ContractsSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard is permission-gated and unavailable over plain HTTP; the
      // address is selectable in the field either way, so fail quietly.
    }
  };

  return (
    <section className="contracts-section" id="contracts">
      <h2 className="section-title">Verified Contracts</h2>
      <p className="section-lede">
        Both contracts are deployed on Base and verified on BaseScan. Always check the address
        before interacting.
      </p>
      <div className="contracts-grid">
        {CONTRACTS.map((contract) => (
          <div key={contract.address} className="contract-card">
            <div className="contract-header">
              <h4 className="contract-name">{contract.name}</h4>
              <span className="status-badge verified">✓ Verified</span>
            </div>
            <p className="contract-description">{contract.description}</p>

            <span className="address-label">Contract address</span>
            <div className="address-display">
              <span className="contract-address" title={contract.address}>
                {contract.address}
              </span>
              <button type="button" className="max-btn" onClick={() => copy(contract.address)}>
                {copied === contract.address ? "Copied" : "Copy"}
              </button>
            </div>

            <a
              className="contract-link"
              href={`${BASESCAN}/${contract.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on BaseScan
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

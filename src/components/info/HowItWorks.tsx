const STEPS = [
  { title: "Stake $BRB", description: "Deposit your $BRB tokens to start earning rewards" },
  { title: "Earn Rewards", description: "Earn 20% base APR + NFT tier bonuses" },
  { title: "Claim Anytime", description: "Claim rewards without unstaking your position" },
  { title: "Unstake", description: "Withdraw your stake + all rewards anytime" },
] as const;

export function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <h2 className="section-title">How Staking Works</h2>
      <div className="steps-grid">
        {STEPS.map((step, index) => (
          <div key={step.title} className="step-card">
            {/* The `0` prefix comes from CSS, so the markup keeps a real index. */}
            <div className="step-number">{index + 1}</div>
            <h4 className="step-title">{step.title}</h4>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

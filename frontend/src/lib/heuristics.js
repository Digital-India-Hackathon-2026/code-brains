/**
 * Frontend-only Behavioral Heuristics Rules Engine
 * Replaces the backend "/api/analyze-trail" route with fully browser-compatible logic.
 */
export function analyzeTrailHeuristics(transactions, accounts) {
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return {
      compositeRiskScore: 0,
      riskLevel: "LOW",
      flaggedReasons: ["No transactions provided for heuristic analysis."],
      timestamp: new Date().toISOString()
    };
  }

  const flaggedReasons = [];
  let scoreMultiplier = 1;
  
  // Heuristic 1: High Transaction Velocity (Smurfing/Layering)
  const sortedTx = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let rapidSplittingCount = 0;
  for (let i = 0; i < sortedTx.length - 1; i++) {
    const diffMs = Math.abs(new Date(sortedTx[i+1].timestamp).getTime() - new Date(sortedTx[i].timestamp).getTime());
    if (diffMs < 120000) { // Under 2 minutes
      rapidSplittingCount++;
    }
  }
  if (rapidSplittingCount > 2) {
    flaggedReasons.push("High-velocity layering sequence: Funds distributed within 120-second thresholds.");
    scoreMultiplier += 0.45;
  }

  // Heuristic 2: Dormant Account Awakening
  const dormantAwaken = accounts?.some((acc) => acc.dormantPeriodDays > 90 && acc.riskScore > 30);
  if (dormantAwaken) {
    flaggedReasons.push("Dormant account reactivation: Account idle for >90 days experiencing rapid inbound deposits.");
    scoreMultiplier += 0.35;
  }

  // Heuristic 3: Round Tripping or Funneling / Structuring
  const highRatioUPI = transactions.filter(tx => tx.method === "UPI" && tx.amount >= 50000).length;
  if (highRatioUPI > 1) {
    flaggedReasons.push("UPI structuring threshold exceeded: Consecutive high-value UPI transfers bypassing standard NEFT/RTGS audits.");
    scoreMultiplier += 0.25;
  }

  // Heuristic 4: Multi-Institution Dispersal
  const uniqueBanks = new Set(transactions.map(tx => tx.destBank || tx.sourceBank));
  if (uniqueBanks.size > 2 && transactions.length > 3) {
    flaggedReasons.push("Multi-institution network: Transfer chain routes money across " + uniqueBanks.size + " separate banking partners.");
    scoreMultiplier += 0.2;
  }

  // Heuristic 5: Under-verification UPI amounts (Structuring under 50k limit)
  const structuringAmountCount = transactions.filter(tx => tx.amount >= 45000 && tx.amount < 50000).length;
  if (structuringAmountCount > 1) {
    flaggedReasons.push("Sub-50k threshold structuring: Multiple transfers clustered at ₹45k - ₹49.9k to circumvent PAN reporting triggers.");
    scoreMultiplier += 0.3;
  }

  // Calculate composite risk score
  const baseRiskScore = Math.min(Math.round(45 * scoreMultiplier), 100);
  const riskLevel = baseRiskScore >= 80 ? "CRITICAL" : baseRiskScore >= 60 ? "HIGH" : baseRiskScore >= 35 ? "MEDIUM" : "LOW";

  return {
    compositeRiskScore: baseRiskScore,
    riskLevel,
    flaggedReasons: flaggedReasons.length > 0 ? flaggedReasons : ["Standard operational threshold: No major mule heuristics triggered."],
    timestamp: new Date().toISOString()
  };
}

/**
 * Intelligent Client-Side Cyber-Forensics Chatbot Simulator
 * Simulates detailed cybersecurity, AML, and forensic analysis responses.
 */
export async function simulateCopilotResponse(message, history) {
  // Simulate network latency for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  const text = message.toLowerCase().trim();

  // 1. Preset Question: Dormant account awakening
  if (text.includes("dormant") || text.includes("awakening") || text.includes("dormancy")) {
    return `### Dormant Account Awakening Analysis

**Dormant Account Awakening** is a high-impact money-mule vector where a bank account that was completely inactive for a prolonged duration (usually 90 to 365 days) is suddenly reactivated with high-velocity, high-volume transactions.

### Heuristic Markers:
- **Prolonged Silence**: Idle accounts with minimal balance (often ₹100 or less) for several months.
- **Instantaneous High-Velocity Deposits**: Sudden influx of fast-moving UPI/IMPS deposits from disjointed source holders.
- **Immediate Outbound Layering**: Funds are rapidly swept or dispersed (95%+ of balance) to multiple other Layer 2 nodes, leaving the account drained.
- **Credential Sales**: Often caused by vulnerable individuals or students selling their active internet banking accounts to fraud cartels.

### Forensic Intervention Recommendation:
1. **Administrative Hold**: Dispatch an emergency inter-bank lien (debit freeze) via the **Secure Interfaces Portal**.
2. **KYC Audit**: Trigger physical and video re-verification (KYC/vKYC) of the registered customer.
3. **Session Diagnostics**: Check the IMEI, device fingerprint, and IP location log to confirm if the transaction session originates from a foreign state or VPN tunnel.`;
  }

  // 2. Preset Question: Layer 1, 2, and 3 mules
  if (text.includes("layer") || text.includes("mule") || text.includes("differ") || text.includes("categories")) {
    return `### Money Mule Network Hierarchy (Layering Structure)

Modern cyber-fraud syndicates compartmentalize money-laundering channels into distinct tiers to break transactional traceability and avoid automated security systems:

### Phase 1: Victims / Origin Nodes
- **Definition**: The source of tainted capital (scams, online phishing, UPI fraud).
- **Indicators**: Direct reports to the National Cyber Crime Portal (NCRP), rapid reversals.

### Phase 2: Layer 1 Mules (Immediate Recipients)
- **Role**: Immediate buffers. They absorb the initial scam deposits.
- **Structure**: High-frequency, low-limit accounts (often UPI/IMPS).
- **Behavior**: Split deposits immediately (usually within 120 seconds) into smaller packages (under ₹50,000) and route them outward to evade manual audit triggers.

### Phase 3: Layer 2 Mules (Consolidation Hubs)
- **Role**: Aggregators. They gather small deposits from dozens of Layer 1 mules.
- **Structure**: Often commercial bank accounts, shell proprietorships, or registered small retailers (GST-registered) to make the volume look like legitimate commerce.
- **Behavior**: Accumulate massive balances before executing a single high-value transfer (NEFT/RTGS) to final off-ramps.

### Phase 4: Layer 3 Mules & Exit Nodes (Off-Ramps)
- **Role**: Final extraction.
- **Structure**: ATM networks, cryptocurrency exchange P2P pools, or international Hawala nodes.
- **Behavior**: Direct conversion into liquid assets, gold, or cryptocurrency, completely terminating the banking trail.

---
*Note: You can trace and visualize these exact hops inside the **Forensic Ledger Trace** tab or freeze active targets instantly.*`;
  }

  // 3. Preset Question: Operation Gold-Smurf
  if (text.includes("gold-smurf") || text.includes("operation") || text.includes("smurf")) {
    return `### Case Profile: Operation Gold-Smurf

**Operation Gold-Smurf** is an active, multi-bank UPI structuring and layering funnel detected in our monitor. 

### Case Diagnostics:
- **Fraud Source**: ₹5,50,000 sourced from an electronic banking phishing portal.
- **Layer 1 Clustered Structuring**: The funds were split into 11 concurrent transactions of exactly ₹49,900 each. This was done within 4 minutes using the same UPI endpoint to avoid the automated ₹50,000 validation audit.
- **Consolidation**: Routed across 3 distinct dormant accounts inside HDFC and Yes Bank.
- **Terminal Destination**: Drained via continuous ATM cash-outs in a border district within 45 minutes of the crime.

### Mitigation Action Dispatch:
- **Debit-Held Status**: 4 Layer 1 accounts successfully locked, securing ₹1,98,000 of the victim's funds.
- **Gateway Alerts**: Emergency lien requests transmitted through SBI and Axis API links.
- **NCRP Alert**: Evidence packets and session IP coordinates gathered for transmission to the state cyber-forensics desk.`;
  }

  // 4. Preset Question: SAR report compilation
  if (text.includes("sar") || text.includes("report") || text.includes("suspicious activity")) {
    return `### Compliance Guide: Compiling Suspicious Activity Reports (SAR)

Under the PMLA (Prevention of Money Laundering Act, 2002) and FIU-IND (Financial Intelligence Unit - India) guidelines, filing a clean, legally robust SAR is mandatory when transaction markers exceed standardized risk profiles.

### Key Sections of a Legal-Grade SAR:
1. **Subject Information**: Full legal name, PAN, Aadhaar link status, associated phone IMEI, and geographic IP logs of the account holder.
2. **Transaction Chronology**: A detailed timeline tracing exactly where the funds originated, how they layered through intermediate nodes, and their final withdrawal vector.
3. **Triggering Heuristics**: Citations of specific system alerts triggered (e.g., *'Structuring Under ₹50k Limits'* or *'Rapid Velocity Layering'*).
4. **Administrative Hold Logs**: Proof of freezing actions, lien logs, and fund retrieval status.

### Automated Compiler:
Use the **SAR Portal** in our dashboard to automatically compile these fields into an official document format, ready for direct transmission to regulatory desks.`;
  }

  // 5. General / Custom ML-AI Agent custom prompt response
  return `### MuleTrace AI Analyst Response

*This response is generated by the localized MuleTrace Client-Side Simulation Engine. You can replace this entirely with your custom ML/AI Agent API/model weights.*

### Forensic Analysis Summary:
- **Query Evaluation**: Checked against the National Money Laundering Registry databases.
- **Heuristics Core**: UPI & IMPS behavioral tracking loops.
- **Action Advice**: For the query "${message}", our forensics system advises auditing the active **Debit-Held Registry** or using the **Interactive Rules Sandbox** to test specific transfer sequence structures.

### Recommended Compliance Actions:
1. **Trigger Inter-Bank Lien**: Block recipient accounts flagged with high risk.
2. **Generate SAR Documentation**: File formal alerts to the FIU desk.
3. **Verify IP/Device Signatures**: Match user logging coordinates to identify VPN or remote proxy anomalies.

---
💡 *DEVELOPER TIP: To integrate your own ML/AI Agent, simply update the \`simulateCopilotResponse\` function in \`heuristics\` or connect it directly to your custom API endpoint!*`;
}

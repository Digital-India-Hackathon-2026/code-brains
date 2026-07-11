import React, { useState, useEffect } from "react";
import { initialAccounts, sandboxScenarios } from "../data";
import { 
  ShieldCheck, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  Clipboard,
  Award,
  PenTool,
  Check,
  FileSpreadsheet,
  X,
  Lock,
  Download,
  Building
} from "lucide-react";

export default function SarReportView({ prepopulatedAccount = null }) {
  const [selectedAccountNo, setSelectedAccountNo] = useState("");
  const [reportNarrative, setReportNarrative] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);
  const [isFiled, setIsFiled] = useState(false);
  
  // Interactive Investigator Profile States
  const [investigatorName, setInvestigatorName] = useState("Director S. K. Iyer");
  const [investigatorRank, setInvestigatorRank] = useState("Chief AML Forensic Analyst");
  const [badgeId, setBadgeId] = useState("FIU-IND-9082");
  const [securityDivision, setSecurityDivision] = useState("Nodal Cyber Intelligence Unit");
  const [isCertified, setIsCertified] = useState(false);
  const [certifyTimestamp, setCertifyTimestamp] = useState("");
  
  // Regulatory success feedback modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState(null);

  // Regulatory checklist states
  const [actions, setActions] = useState({
    freezeAllFunds: true,
    transmitToFiuInd: true,
    centralMuleBlacklist: true,
    alertPolicePortal: false
  });

  // Load account
  const accounts = initialAccounts;
  const activeAccount = accounts.find(acc => acc.accountNumber === selectedAccountNo) || prepopulatedAccount || accounts[3]; // Default to Karan Johar (Sleeper Core)

  useEffect(() => {
    if (prepopulatedAccount) {
      setSelectedAccountNo(prepopulatedAccount.accountNumber);
    } else {
      setSelectedAccountNo(accounts[3].accountNumber); // Default sleeper
    }
  }, [prepopulatedAccount]);

  // Default descriptive narrative if not generated
  useEffect(() => {
    setReportNarrative(`EXECUTIVE SUMMARY & FORENSIC OBSERVATION:\n\nSubject account ${activeAccount.accountNumber} registered under bank institution ${activeAccount.bankName} belonging to holder ${activeAccount.holderName} is flagged as highly aligned with money laundering characteristics (${activeAccount.type}).\n\nHeuristics trace indicates a classic dormant account awakening cycle: the ledger profile was completely inactive for ${activeAccount.dormantPeriodDays} days, followed by sudden high-velocity UPI inflows totaling ${formatINR(activeAccount.balance)}. Cumulative funds were immediately dispersed via IMPS outbound routing to secondary and tertiary downstream layers within 180 seconds. Physical IMEI footprint matches registered device hubs in ${activeAccount.location}. Immediate debit freezing and central blacklisting are recommended under Section 62 of the Banking Regulations Act.`);
    setIsCertified(false);
    setCertifyTimestamp("");
  }, [activeAccount]);

  // Find related transactions in static scenarios
  const getRelatedTransactions = () => {
    const allScenariosTxs = sandboxScenarios.flatMap(s => s.transactions);
    return allScenariosTxs.filter(
      tx => tx.sourceAccount === activeAccount.accountNumber || 
            tx.destAccount === activeAccount.accountNumber ||
            tx.sourceHolder.includes(activeAccount.holderName) ||
            tx.destHolder.includes(activeAccount.holderName)
    );
  };

  const relatedTransactions = getRelatedTransactions();

  // Rupees formatting helper
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Run server-side Gemini draft generator to write a legal-grade executive summary of the laundering case!
  const handleAiDraftNarrative = async () => {
    setIsNarrating(true);
    try {
      const txHistoryText = relatedTransactions.map(
        tx => `- Tx ID ${tx.id}: ${tx.sourceHolder} -> ${tx.destHolder} of ${formatINR(tx.amount)} via ${tx.method} on ${tx.timestamp}`
      ).join("\n");

      const prompt = `Draft an extremely professional, legal-grade compliance executive summary for a Suspicious Activity Report (SAR). 
Subject Account Details:
- Holder: ${activeAccount.holderName}
- Account No: ${activeAccount.accountNumber}
- Bank Name: ${activeAccount.bankName}
- Risk Level: ${activeAccount.riskLevel} (${activeAccount.riskScore}% risk score)
- Role inside laundering network: ${activeAccount.type}
- Linked device: ${activeAccount.deviceFingerprint}
- Location: ${activeAccount.location}
- Linked cellular number: ${activeAccount.phoneLinked}

Audited Transaction Trail:
${txHistoryText}

Draft an authoritative forensic brief outlining observed money-laundering vectors (dormant awakening, rapid smurfing, split routing). Mention Section 62 of the Banking Regulations Act. Output only the professional draft text without greetings or signature placeholders.`;

      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (!response.ok) {
        throw new Error("AI service experienced an issue.");
      }

      const data = await response.json();
      setReportNarrative(data.content);
    } catch (err) {
      console.error(err);
      // Fallback
      setReportNarrative(`EXECUTIVE NARRATIVE SUMMARY (AUTOGENERATED FALLBACK):\n\nSubject account ${activeAccount.accountNumber} registered under ${activeAccount.bankName} holder ${activeAccount.holderName} is flagged as a Layer 2 Money Mule inside current suspicious clusters. Heuristics trace shows the account awakens from dormancy (${activeAccount.dormantPeriodDays} days idle) to receive ₹485,000 via IMPS transfers, instantly distributing cumulative balances out to multiple destination accounts within a sub-3 minute window. Device IMEI indicates multiple logins matching flagged SIM hubs in ${activeAccount.location}. Immediate asset freeze is recommended under Section 62 of the Banking Regulations Act.`);
    } finally {
      setIsNarrating(false);
    }
  };

  // Digital secure SHA generator for report certification
  const generateForensicSignatureHash = () => {
    const textToHash = activeAccount.accountNumber + activeAccount.holderName + badgeId + (reportNarrative.substring(0, 30));
    let hash = 0;
    for (let i = 0; i < textToHash.length; i++) {
      const char = textToHash.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return "FIU-SEC-" + Math.abs(hash).toString(16).toUpperCase() + "-" + new Date().getFullYear();
  };

  const handleCertifyReport = () => {
    setIsCertified(true);
    setCertifyTimestamp(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
  };

  const handleFileReport = () => {
    if (!isCertified) {
      handleCertifyReport();
    }
    
    setIsFiled(true);
    setTimeout(() => {
      setIsFiled(false);
      const generatedHash = generateForensicSignatureHash();
      setReceiptDetails({
        dispatchId: "DISPATCH-FIU-" + Math.floor(100000 + Math.random() * 900000),
        digitalSignature: generatedHash,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
        accountName: activeAccount.holderName,
        accountNumber: activeAccount.accountNumber,
        bank: activeAccount.bankName,
        actionsEnforced: Object.entries(actions)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name.replace(/([A-Z])/g, " $1").toUpperCase()),
        signee: investigatorName,
        signeeBadge: badgeId
      });
      setIsReceiptModalOpen(true);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Selector banner */}
      <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-black/40">
        <div>
          <label className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-2">Select Offending Account to Draft SAR</label>
          <select
            value={selectedAccountNo}
            onChange={(e) => setSelectedAccountNo(e.target.value)}
            className="bg-[#080808] border border-white/10 text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono uppercase tracking-wider cursor-pointer transition-all"
          >
            {accounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.holderName} ({acc.bankName} - {acc.accountNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Official Form Canvas */}
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-8 text-white/80 select-text relative overflow-hidden shadow-xl shadow-black/40" id="printable-sar">
          
          {/* Subtle regulatory stamp overlay in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.01] pointer-events-none select-none flex flex-col items-center justify-center border-4 border-dashed border-white/5 p-16 rotate-12 rounded-2xl">
            <Award className="w-64 h-64" />
            <div className="text-3xl font-mono font-bold uppercase tracking-[0.3em] mt-4 text-center">FIU-IND CERTIFIED</div>
            <div className="text-sm font-mono mt-2 tracking-widest">SUB-SECTION 62 COMPLIANT</div>
          </div>

          {/* Header branding */}
          <div className="border-b border-white/20 pb-5 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">FORM SAR-FIU-IND</div>
              <h1 className="text-xl font-bold text-white uppercase tracking-widest font-sans">SUSPICIOUS ACTIVITY REPORT</h1>
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider">FIU Regulatory Dispatch Desk • Confidential Document</p>
            </div>
            <div className="text-center sm:text-right border border-white/10 bg-[#080808]/80 p-4 rounded-xl font-mono text-[10px] uppercase tracking-wider space-y-1 shrink-0">
              <div>REPORT DESK REF: <strong className="text-white font-bold">SAR-2026-90412</strong></div>
              <div>DATE COMPILED: <strong className="text-white/80">2026-07-09 UTC</strong></div>
              <div>CLASSIFICATION: <strong className="text-rose-400 font-bold">CRITICAL / CONFIDENTIAL</strong></div>
            </div>
          </div>

          {/* Section 1: Offending Subject details */}
          <div className="space-y-4 relative z-10">
            <h3 className="text-[10px] font-mono font-bold text-white/50 tracking-widest uppercase border-b border-white/10 pb-2">
              I. Offending Account Subject Demographics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1 bg-[#080808]/40 p-3 rounded-xl border border-white/5">
                <div className="text-white/30 uppercase text-[9px] tracking-wider font-bold">SUBJECT FULL NAME</div>
                <div className="text-white font-bold">{activeAccount.holderName}</div>
              </div>
              <div className="space-y-1 bg-[#080808]/40 p-3 rounded-xl border border-white/5">
                <div className="text-white/30 uppercase text-[9px] tracking-wider font-bold">BANKING INSTITUTION</div>
                <div className="text-white font-bold">{activeAccount.bankName}</div>
              </div>
              <div className="space-y-1 bg-[#080808]/40 p-3 rounded-xl border border-white/5">
                <div className="text-white/30 uppercase text-[9px] tracking-wider font-bold">ACCOUNT NUMBER</div>
                <div className="text-white font-bold">{activeAccount.accountNumber}</div>
              </div>
              <div className="space-y-1 bg-[#080808]/40 p-3 rounded-xl border border-white/5">
                <div className="text-white/30 uppercase text-[9px] tracking-wider font-bold">PRIMARY IP LOCALE</div>
                <div className="text-white/80">{activeAccount.location}</div>
              </div>
              <div className="space-y-1 bg-[#080808]/40 p-3 rounded-xl border border-white/5">
                <div className="text-white/30 uppercase text-[9px] tracking-wider font-bold">CELLULAR LINKAGE</div>
                <div className="text-white/80">{activeAccount.phoneLinked}</div>
              </div>
              <div className="space-y-1 bg-[#080808]/40 p-3 rounded-xl border border-white/5">
                <div className="text-white/30 uppercase text-[9px] tracking-wider font-bold">DEVICE FINGERPRINT</div>
                <div className="text-white/80 truncate">{activeAccount.deviceFingerprint}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Trails Audited */}
          <div className="space-y-4 relative z-10">
            <h3 className="text-[10px] font-mono font-bold text-white/50 tracking-widest uppercase border-b border-white/10 pb-2">
              II. Audited Financial Transaction Log
            </h3>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080808]/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#080808] text-white/40 text-[9px] border-b border-white/10 uppercase tracking-widest font-bold">
                      <th className="p-3">Tx Hash</th>
                      <th className="p-3">Pathway</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {relatedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-white/30 font-mono uppercase text-[10px]">
                          No transactions registered inside static case arrays for this account.
                        </td>
                      </tr>
                    ) : (
                      relatedTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-3 text-white/30 font-bold">{tx.id}</td>
                          <td className="p-3">{tx.sourceHolder} → {tx.destHolder}</td>
                          <td className="p-3">{tx.method}</td>
                          <td className="p-3 font-sans text-[11px]">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                          <td className="p-3 text-right font-sans text-emerald-400 font-bold">
                            {formatINR(tx.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: Narrative summary */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-[10px] font-mono font-bold text-white/50 tracking-widest uppercase">
                III. Forensics Analysis Narrative
              </h3>
              <button
                onClick={handleAiDraftNarrative}
                disabled={isNarrating}
                className="px-3.5 py-2 bg-white hover:bg-white/90 text-black border-transparent rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-white/5"
              >
                {isNarrating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Drafting Brief...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                    <span>Re-Draft with Gemini</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={reportNarrative}
              onChange={(e) => setReportNarrative(e.target.value)}
              placeholder="Draft legal brief or trigger the server-side Gemini draft generator above to write a professional compliance-grade suspicious activity narrative..."
              className="w-full min-h-[160px] bg-[#080808] border border-white/10 rounded-xl p-4 text-xs font-sans text-white/90 placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 leading-relaxed font-sans transition-all"
            />
          </div>

          {/* Section 4: Interactive official signature pad */}
          <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
            <h3 className="text-[10px] font-mono font-bold text-white/50 tracking-widest uppercase">
              IV. Investigator Certification & E-Signature
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#080808]/40 p-5 border border-white/10 rounded-2xl">
              
              {/* Left Column: Form Fields */}
              <div className="space-y-3 text-xs font-mono uppercase text-white/70">
                <div className="space-y-1">
                  <label className="text-[8px] text-white/40 font-bold block">Signee Authorized Name</label>
                  <input 
                    type="text" 
                    value={investigatorName} 
                    onChange={e => { setInvestigatorName(e.target.value); setIsCertified(false); }}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 uppercase text-[11px] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-white/40 font-bold block">Compliance Official Rank</label>
                  <input 
                    type="text" 
                    value={investigatorRank} 
                    onChange={e => { setInvestigatorRank(e.target.value); setIsCertified(false); }}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 uppercase text-[11px] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 font-bold block">Regulatory Badge ID</label>
                    <input 
                      type="text" 
                      value={badgeId} 
                      onChange={e => { setBadgeId(e.target.value); setIsCertified(false); }}
                      className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 uppercase text-[11px] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 font-bold block">Governing Division</label>
                    <select 
                      value={securityDivision} 
                      onChange={e => { setSecurityDivision(e.target.value); setIsCertified(false); }}
                      className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 uppercase text-[10px] transition-all"
                    >
                      <option value="Nodal Cyber Intelligence Unit">Nodal Cyber Unit</option>
                      <option value="AML Investigation Division">AML Forensic Div</option>
                      <option value="FIU-IND Escaped Asset Desk">FIU Escaped Asset</option>
                      <option value="SBI Nodal Fraud Cell">SBI Fraud Cell</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: E-Sign Receipt and Interactive Verification stamp */}
              <div className="border border-dashed border-white/20 p-4 bg-[#0c0c0c]/50 rounded-xl flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[8px] font-mono text-white/15 tracking-widest">
                  STAMP SECURITY
                </div>
                {isCertified ? (
                  <div className="space-y-2 text-center my-auto animate-in fade-in zoom-in-95 duration-300">
                    <div className="inline-flex p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl mb-1">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="text-[11px] font-bold font-mono tracking-widest text-emerald-400 uppercase">REPORT SECURELY CERTIFIED</div>
                    <div className="font-serif italic text-white/90 text-sm tracking-wider uppercase border-b border-white/10 pb-1.5 max-w-[200px] mx-auto">
                      {investigatorName}
                    </div>
                    <div className="text-[8px] text-white/40 font-mono tracking-wider">
                      SHA Key: {generateForensicSignatureHash().substring(0, 14)}...
                    </div>
                    <div className="text-[8px] text-white/40 font-mono">
                      TS: {certifyTimestamp}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-3 py-2 text-center">
                    <PenTool className="w-6 h-6 text-white/25 animate-bounce" />
                    <p className="text-[9px] text-white/40 uppercase font-mono tracking-widest leading-relaxed">
                      Investigator parameters must be certified under oath to dispatch.
                    </p>
                    <button
                      type="button"
                      onClick={handleCertifyReport}
                      className="px-4 py-2 bg-white hover:bg-white/90 text-black font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-white/5"
                    >
                      Certify & Generate Signature
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: Action Deck Summary */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl shadow-black/40">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Regulatory Controls</h3>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Disciplinary actions accompanying this dispatch</p>
            </div>

            <div className="space-y-3.5 font-sans text-xs">
              {/* Action 1 */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none group bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={actions.freezeAllFunds}
                  onChange={(e) => setActions({ ...actions, freezeAllFunds: e.target.checked })}
                  className="mt-0.5 rounded border border-white/20 bg-[#080808] text-cyan-500 focus:ring-cyan-500/20"
                />
                <div>
                  <div className="text-white/95 font-bold font-mono text-[10px] uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Freeze Account Assets</div>
                  <div className="text-[9px] text-white/40 mt-1 font-mono uppercase tracking-wider leading-relaxed">Immobilizes all UPI, IMPS, RTGS, and debit card outflows immediately.</div>
                </div>
              </label>

              {/* Action 2 */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none group bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={actions.transmitToFiuInd}
                  onChange={(e) => setActions({ ...actions, transmitToFiuInd: e.target.checked })}
                  className="mt-0.5 rounded border border-white/20 bg-[#080808] text-cyan-500 focus:ring-cyan-500/20"
                />
                <div>
                  <div className="text-white/95 font-bold font-mono text-[10px] uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Transmit payload to FIU-IND</div>
                  <div className="text-[9px] text-white/40 mt-1 font-mono uppercase tracking-wider leading-relaxed">Dispatches structured XML audit logs to the Financial Intelligence Unit.</div>
                </div>
              </label>

              {/* Action 3 */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none group bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={actions.centralMuleBlacklist}
                  onChange={(e) => setActions({ ...actions, centralMuleBlacklist: e.target.checked })}
                  className="mt-0.5 rounded border border-white/20 bg-[#080808] text-cyan-500 focus:ring-cyan-500/20"
                />
                <div>
                  <div className="text-white/95 font-bold font-mono text-[10px] uppercase tracking-widest group-hover:text-cyan-400 transition-colors">National Mule Database Addition</div>
                  <div className="text-[9px] text-white/40 mt-1 font-mono uppercase tracking-wider leading-relaxed">Blacklists linked Mobile IMEI and PAN details across all banks.</div>
                </div>
              </label>

              {/* Action 4 */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none group bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={actions.alertPolicePortal}
                  onChange={(e) => setActions({ ...actions, alertPolicePortal: e.target.checked })}
                  className="mt-0.5 rounded border border-white/20 bg-[#080808] text-cyan-500 focus:ring-cyan-500/20"
                />
                <div>
                  <div className="text-white/95 font-bold font-mono text-[10px] uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Dispatch to Cyber-Police (1930)</div>
                  <div className="text-[9px] text-white/40 mt-1 font-mono uppercase tracking-wider leading-relaxed">Auto-populates and files police complaints in the NCRP system.</div>
                </div>
              </label>
            </div>

            {/* Submit button */}
            <button
              onClick={handleFileReport}
              disabled={isFiled}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 text-black disabled:text-white/20 font-mono font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isFiled ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Transmitting File...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Transmit Official SAR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* PROFESSIONAL COMPLIANCE DISPATCH RECEIPT MODAL */}
      {isReceiptModalOpen && receiptDetails && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-emerald-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-emerald-950/10">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">REGULATORY TRANSMISSION SECURED</h3>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">FIU-IND Central Registry Ledger Sync Receipt</p>
                </div>
              </div>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Details Body */}
            <div className="p-6 space-y-5 font-mono text-[10px] uppercase text-white/80 select-text">
              <div className="bg-[#080808] border border-emerald-500/10 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-white/40 text-[9px]">
                  <span>DISPATCH REFERENCE</span>
                  <span className="text-emerald-400 font-bold">{receiptDetails.dispatchId}</span>
                </div>
                <div className="flex justify-between">
                  <span>DIGITAL HASH</span>
                  <span className="text-white font-bold text-[9px]">{receiptDetails.digitalSignature}</span>
                </div>
                <div className="flex justify-between">
                  <span>TRANSMITTED TS</span>
                  <span>{receiptDetails.timestamp}</span>
                </div>
              </div>

              {/* Subject Details */}
              <div className="space-y-1.5">
                <div className="text-[9px] text-white/40 font-bold tracking-widest">Subject Account Node</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#080808] p-3 border border-white/10 rounded-xl">
                  <div>
                    <span className="text-white/30 text-[8px]">HOLDER</span>
                    <div className="text-white font-bold">{receiptDetails.accountName}</div>
                  </div>
                  <div>
                    <span className="text-white/30 text-[8px]">ACCOUNT NUMBER</span>
                    <div className="text-white font-bold">{receiptDetails.accountNumber}</div>
                  </div>
                </div>
              </div>

              {/* Actions Log */}
              <div className="space-y-1.5">
                <div className="text-[9px] text-white/40 font-bold tracking-widest">Enforced Directives Status</div>
                <div className="border border-white/10 p-4 bg-[#080808] space-y-2 rounded-xl">
                  {receiptDetails.actionsEnforced.map((act) => (
                    <div key={act} className="flex items-center gap-2 text-emerald-400 text-[9px]">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{act}</span>
                      <span className="text-white/30 text-[8px] ml-auto">PENDING CONFIRMATION</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification Signature Stamp */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[9px]">
                <div>
                  <span className="text-white/30">CERTIFIED NODE ANALYST</span>
                  <div className="text-white font-bold">{receiptDetails.signee}</div>
                  <div className="text-white/50">{receiptDetails.signeeBadge}</div>
                </div>
                <div className="text-right">
                  <span className="text-white/30">COMPLIANCE CODE</span>
                  <div className="text-white font-bold text-rose-400">SUB-62_FIU_MULE</div>
                  <div className="text-white/30 font-bold text-[8px]">SECURE SYSTEM DEPLOYMENT</div>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#080808] flex items-center justify-between">
              <span className="text-[9px] text-emerald-400/60 font-mono tracking-wider font-bold">
                PAYLOAD DISTRIBUTED SUCCESSFULLY
              </span>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest transition-all cursor-pointer rounded-xl"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

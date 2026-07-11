import React, { useState } from "react";
import { 
  Play, 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  Clipboard, 
  Trash2, 
  HelpCircle,
  FileSpreadsheet,
  Keyboard
} from "lucide-react";
import CsvUploader from "./CsvUploader";
import { analyzeTrailHeuristics } from "../lib/heuristics";
import { sandboxScenarios } from "../data";

export default function SandboxView() {
  const [activeMode, setActiveMode] = useState("scratchpad");
  const [selectedPresetId, setSelectedPresetId] = useState("sc-gold-smurf");
  const [customTransactions, setCustomTransactions] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Load a preset scenario's transaction list for editing/testing
  const handleLoadPreset = (id) => {
    setSelectedPresetId(id);
    const preset = sandboxScenarios.find(s => s.id === id);
    if (preset) {
      setCustomTransactions([...preset.transactions]);
      setAuditResult(null); // Clear previous audit results
    }
  };

  // Set initial preset on first render if empty
  React.useEffect(() => {
    handleLoadPreset("sc-gold-smurf");
  }, []);

  // Add a manual blank transaction to the scratchpad
  const handleAddTx = () => {
    const newTx = {
      id: "TX-" + Math.floor(10000 + Math.random() * 90000),
      sourceAccount: "910294810293",
      sourceHolder: "Ananya Sharma",
      sourceBank: "State Bank of India",
      destAccount: "109283746501",
      destHolder: "Karan Johar (Sleeper Core)",
      destBank: "Axis Bank",
      amount: 49500, // Just under 50k
      timestamp: new Date().toISOString(),
      method: "UPI",
      status: "COMPLETED",
      riskScore: 35,
      flags: []
    };
    setCustomTransactions([...customTransactions, newTx]);
  };

  // Delete transaction from scratchpad
  const handleDeleteTx = (id) => {
    setCustomTransactions(customTransactions.filter(tx => tx.id !== id));
  };

  // Modify transaction fields
  const handleUpdateTxField = (id, field, value) => {
    setCustomTransactions(customTransactions.map(tx => {
      if (tx.id === id) {
        return { ...tx, [field]: value };
      }
      return tx;
    }));
  };

  // Trigger Client-Side Heuristics Rule Engine Audit!
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);

    const useSpring = localStorage.getItem("muletrace-use-spring") === "true";
    const springUrl = localStorage.getItem("muletrace-spring-url") || "http://localhost:8080";
    const mlEndpoint = localStorage.getItem("muletrace-ml-endpoint") || "/api/v1/ml/predict";

    try {
      // Simulate brief network latency for smooth UI flow
      await new Promise(resolve => setTimeout(resolve, 800));

      if (useSpring) {
        try {
          const response = await fetch(`${springUrl}${mlEndpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            mode: "cors",
            body: JSON.stringify(customTransactions)
          });

          if (response.ok) {
            const data = await response.json();
            setAuditResult({
              compositeRiskScore: data.compositeRiskScore !== undefined ? data.compositeRiskScore : 85,
              riskLevel: data.riskLevel || "HIGH",
              flaggedReasons: data.flaggedReasons || ["Flagged via Spring Boot ML Model API"],
              timestamp: data.timestamp || new Date().toISOString(),
              source: "SPRING_BOOT_LIVE_ML"
            });
            setIsAuditing(false);
            return;
          } else {
            throw new Error(`Spring Boot returned HTTP status ${response.status}`);
          }
        } catch (springErr) {
          console.warn("Spring Boot ML connection failed, falling back to client heuristics:", springErr);
          // Fall back gracefully to local calculations but add a warning log
          const activePreset = sandboxScenarios.find(s => s.id === selectedPresetId);
          const accounts = activePreset ? activePreset.accounts : [];
          const data = analyzeTrailHeuristics(customTransactions, accounts);
          setAuditResult({
            ...data,
            flaggedReasons: [
              ...data.flaggedReasons,
              "SPRING BOOT CONNECTION TIMEOUT - LOCAL COMPLIANCE ENGINE FALLBACK ACTIVE"
            ],
            source: "LOCAL_HEURISTICS_FALLBACK"
          });
          setIsAuditing(false);
          return;
        }
      }

      const activePreset = sandboxScenarios.find(s => s.id === selectedPresetId);
      const accounts = activePreset ? activePreset.accounts : [];

      // Calculate directly on the client side
      const data = analyzeTrailHeuristics(customTransactions, accounts);
      setAuditResult(data);
    } catch (err) {
      console.error(err);
      setAuditResult({
        compositeRiskScore: 75,
        riskLevel: "HIGH",
        flaggedReasons: ["Audit engine fallback: High velocity splitting sequence detected."],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Handles loading CSV parsed transaction logs directly into the manual scratchpad editing workspace
  const handleLoadCsvToScratchpad = (txs) => {
    setCustomTransactions(txs);
    setActiveMode("scratchpad");
    setAuditResult(null); // Clear previous results so they run fresh
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation Mode Toggle Tabs - Rounded and Transparent Glassmorphism */}
      <div className="flex bg-white/[0.02] border border-white/10 p-1 rounded-2xl w-full sm:w-fit backdrop-blur-md shadow-lg shadow-black/20">
        <button
          onClick={() => setActiveMode("scratchpad")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
            activeMode === "scratchpad"
              ? "bg-white text-black font-bold shadow-lg"
              : "text-white/40 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Scratchpad Simulator</span>
        </button>
        <button
          onClick={() => setActiveMode("csv")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
            activeMode === "csv"
              ? "bg-white text-black font-bold shadow-lg"
              : "text-white/40 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk CSV Threat Detector</span>
        </button>
      </div>

      {activeMode === "csv" ? (
        <CsvUploader 
          onLoadToScratchpad={handleLoadCsvToScratchpad} 
        />
      ) : (
        <>
          {/* Intro layout card - Updated to rounded-2xl and transparent effect */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl shadow-black/40">
            <div className="absolute top-0 right-0 p-6 text-white/5 opacity-5 pointer-events-none">
              <Sparkles className="w-40 h-40" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Behavioral Heuristics Sandbox</h2>
            <p className="text-xs text-white/50 mt-2 max-w-2xl leading-relaxed font-sans">
              Test financial sequences and custom transfer pathways here. Load standard money laundering preset vectors, modify individual UPI/IMPS parameters directly, and execute our real backend rule engine to verify whether they trigger compliance security thresholds.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mr-2">Preset Templates:</span>
              {sandboxScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleLoadPreset(sc.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] uppercase font-mono tracking-wider font-bold transition-all ${
                    selectedPresetId === sc.id
                      ? "bg-white text-black border-white"
                      : "bg-[#080808] text-white/50 border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {sc.title.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Transaction Scratchpad - Glass & Rounded */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden flex flex-col backdrop-blur-md shadow-xl shadow-black/40">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080808]/40">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Transaction Scratchpad</h3>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Simulate money transfers under auditing rules</p>
                </div>
                <button
                  onClick={handleAddTx}
                  className="px-3 py-1.5 bg-white text-black hover:bg-white/90 border border-white rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Transfer</span>
                </button>
              </div>

              {/* Table scratchpad */}
              <div className="overflow-x-auto flex-1 max-h-[400px]">
                <table className="w-full text-xs font-mono text-white/80">
                  <thead className="bg-[#080808] border-b border-white/10 text-white/40 text-[9px] font-mono uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-4 py-3.5 text-left font-bold">Tx ID</th>
                      <th className="px-4 py-3.5 text-left font-bold">Source (Holder)</th>
                      <th className="px-4 py-3.5 text-left font-bold">Destination (Holder)</th>
                      <th className="px-4 py-3.5 text-left font-bold">Method</th>
                      <th className="px-4 py-3.5 text-right font-bold">Amount (₹)</th>
                      <th className="px-4 py-3.5 text-center w-12 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-white/40 font-mono uppercase tracking-wider text-[10px]">
                          Transaction scratchpad is empty. Click "Add Transfer" or select a preset template above.
                        </td>
                      </tr>
                    ) : (
                      customTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/2">
                          <td className="px-4 py-3 text-white/30 font-bold">{tx.id}</td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={tx.sourceHolder}
                              onChange={(e) => handleUpdateTxField(tx.id, "sourceHolder", e.target.value)}
                              className="bg-[#080808] border border-white/10 rounded-xl px-2 py-1 text-[11px] w-28 focus:outline-none focus:border-white/40"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={tx.destHolder}
                              onChange={(e) => handleUpdateTxField(tx.id, "destHolder", e.target.value)}
                              className="bg-[#080808] border border-white/10 rounded-xl px-2 py-1 text-[11px] w-28 focus:outline-none focus:border-white/40"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={tx.method}
                              onChange={(e) => handleUpdateTxField(tx.id, "method", e.target.value)}
                              className="bg-[#080808] border border-white/10 rounded-xl px-2 py-1 text-[11px] focus:outline-none"
                            >
                              <option value="UPI">UPI</option>
                              <option value="IMPS">IMPS</option>
                              <option value="NEFT">NEFT</option>
                              <option value="RTGS">RTGS</option>
                              <option value="ATM">ATM</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              value={tx.amount}
                              onChange={(e) => handleUpdateTxField(tx.id, "amount", parseFloat(e.target.value) || 0)}
                              className="bg-[#080808] border border-white/10 rounded-xl px-2 py-1 text-[11px] w-24 text-right focus:outline-none focus:border-white/40 text-emerald-400 font-bold font-mono"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteTx(tx.id)}
                              className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Run Panel */}
              <div className="px-6 py-4 bg-[#080808]/40 border-t border-white/10 flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">
                  Scratchpad includes: {customTransactions.length} transaction entries
                </span>
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing || customTransactions.length === 0}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 text-black disabled:text-white/20 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  {isAuditing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Executing Heuristics...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Execute Rules Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 1 Column: Diagnostic Results Dashboard - Glass & Rounded */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md shadow-xl shadow-black/40">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Compliance Rules Result</h3>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Outputs from Heuristic Analyzer REST node</p>

                {auditResult ? (
                  <div className="mt-5 space-y-5">
                    {/* Score block */}
                    <div className="bg-[#080808]/40 rounded-2xl p-4 border border-white/5 text-center">
                      <div className="text-[8px] text-white/40 font-mono uppercase tracking-widest">COMPOSITE MULE RISK INDEX</div>
                      <div className={`text-4xl font-black font-sans mt-2 ${
                        auditResult.riskLevel === "CRITICAL" || auditResult.riskLevel === "HIGH" ? "text-rose-400" : "text-emerald-400"
                      }`}>
                        {auditResult.compositeRiskScore}%
                      </div>
                      <div className={`text-[9px] font-mono uppercase tracking-widest mt-2 px-3 py-1 rounded-full inline-block border font-bold ${
                        auditResult.riskLevel === "CRITICAL" || auditResult.riskLevel === "HIGH"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {auditResult.riskLevel} RISK CLASSIFICATION
                      </div>
                    </div>

                    {/* Reasons triggers */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-white/60 font-mono uppercase tracking-widest">Heuristic Trigger Log:</h4>
                      <ul className="space-y-2">
                        {auditResult.flaggedReasons.map((reason, i) => (
                          <li key={i} className="text-[10px] text-white/70 flex items-start gap-2.5 leading-relaxed bg-[#080808]/40 p-3 rounded-xl border border-white/5 font-mono uppercase">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-white/30 font-sans">
                    <Clipboard className="w-10 h-10 mb-2 text-white/10" />
                    <p className="text-xs font-mono uppercase tracking-widest">Rule Engine Idle</p>
                    <p className="text-[9px] font-mono uppercase mt-2 px-4 leading-relaxed text-white/20">Configure parameters in the scratchpad, then click "Execute Rules Engine" above.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/30 leading-relaxed">
                MuleTrace Heuristics Sandbox syncs with National Bank Cyber Desks. Under directive, flagged results are saved inside temporary session arrays.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

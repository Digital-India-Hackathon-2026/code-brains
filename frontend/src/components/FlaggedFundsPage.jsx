import React, { useState } from "react";
import { 
  Banknote, 
  ArrowLeft, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Download, 
  AlertTriangle, 
  Building, 
  Search, 
  ChevronRight, 
  Check, 
  Database,
  Lock,
  Unlock,
  Info
} from "lucide-react";

export default function FlaggedFundsPage({ alerts, onBack, onGoToSar }) {
  // Calculator/Estimator States
  const [estAmount, setEstAmount] = useState(350000);
  const [estBank, setEstBank] = useState("State Bank of India");
  const [estHops, setEstHops] = useState(2);
  const [estUrgency, setEstUrgency] = useState("IMMEDIATE");
  
  // Bulk action states
  const [isBulkHolding, setIsBulkHolding] = useState(false);
  const [bulkLog, setBulkLog] = useState([]);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sum calculations
  const totalAmount = alerts.reduce((acc, curr) => acc + curr.amount, 0);
  const averageAmount = Math.round(totalAmount / (alerts.length || 1));
  const activeBlockedCount = alerts.filter(a => a.status === "BLOCKED").length;
  const blockedAmountSum = alerts.filter(a => a.status === "BLOCKED").reduce((acc, curr) => acc + curr.amount, 0);

  // Recovery calculations
  const estimatedRecoveryRate = 78; // static compliance rate
  const calculatedTraced = Math.round(totalAmount * (estimatedRecoveryRate / 100));

  // Custom formatted Indian Rupees
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Estimator Logic
  const calculateRecoveryProbability = () => {
    let base = 85;
    // more hops decreases chance
    base -= (estHops - 1) * 15;
    // large amount slightly decreases velocity of hold
    if (estAmount > 500000) base -= 10;
    // urgency multiplier
    if (estUrgency === "ROUTINE") base -= 15;
    return Math.max(25, base);
  };

  const calculateHoldTime = () => {
    let base = 120; // seconds
    if (estUrgency === "IMMEDIATE") base = 35;
    if (estHops > 2) base += 180;
    return base;
  };

  const handleRunBulkHold = () => {
    setIsBulkHolding(true);
    setBulkLog([]);
    setBulkSuccess(false);

    const logSteps = [
      "Securing administrative cryptographic keys...",
      "Connecting to State Bank of India gateway - Dispatching Sub-section 62 holds...",
      "Securing HDFC Bank ledger nodes - Dispatched debit freeze on 4 targets...",
      "Contacting Axis Bank API - Frozen 2 accounts under suspect Smurf Funnels...",
      "Transmitting national ledger lock indicators to National Payment Corp of India (NPCI)...",
      "Broadcasting secure holding updates to all 6 partner nodes.",
      "Database status updated: Pending transfers locked."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logSteps.length) {
        setBulkLog(prev => [...prev, `[SYSTEM] ${logSteps[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setIsBulkHolding(false);
        setBulkSuccess(true);
      }
    }, 500);
  };

  const getBankName = (accountNo) => {
    if (accountNo.startsWith("91") || accountNo.startsWith("9")) return "State Bank of India";
    if (accountNo.startsWith("42") || accountNo.startsWith("4")) return "HDFC Bank";
    if (accountNo.startsWith("55") || accountNo.startsWith("5")) return "ICICI Bank";
    if (accountNo.startsWith("10") || accountNo.startsWith("1")) return "Axis Bank";
    if (accountNo.startsWith("88") || accountNo.startsWith("8")) return "Punjab National Bank";
    return "Bank of Baroda";
  };

  const filteredNodes = alerts.filter(alert => {
    const bank = getBankName(alert.destAccount);
    return alert.destHolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.destAccount.includes(searchQuery) ||
      bank.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/40">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-mono border border-emerald-500/20 uppercase tracking-widest font-bold rounded-lg">
                LEDGER CENTER
              </span>
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">
                FUNDS RECOVERY & TRACING
              </span>
            </div>
            <h1 className="text-lg font-bold text-white uppercase tracking-widest font-sans mt-0.5">
              Flagged Funds Audit Console
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-3 py-1 uppercase tracking-widest font-bold rounded-lg animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>78% RECOVERY QUOTA EXCEEDED</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Total Flagged Volume</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-white">{formatINR(totalAmount)}</h3>
            <p className="text-[9px] text-white/30 font-mono uppercase tracking-wider mt-1.5">Across all registered cases</p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-emerald-400/80 font-mono tracking-widest uppercase">Secured & Debit-Held</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-emerald-400">{formatINR(blockedAmountSum || totalAmount * 0.42)}</h3>
            <p className="text-[9px] text-emerald-400/40 font-mono uppercase tracking-wider mt-1.5">
              {activeBlockedCount} nodes frozen completely
            </p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-amber-400/80 font-mono tracking-widest uppercase">Traced & Recoverable Rate</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-amber-400">{estimatedRecoveryRate}%</h3>
            <div className="h-1.5 w-full bg-white/5 mt-3.5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${estimatedRecoveryRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-cyan-400/80 font-mono tracking-widest uppercase">Average Ledger Entry</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-cyan-400">{formatINR(averageAmount)}</h3>
            <p className="text-[9px] text-cyan-400/40 font-mono uppercase tracking-wider mt-1.5">Median single siphon volume</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Interactive Estimates and Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box 1: Ledger Recovery Speed Estimator */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/40">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Interactive Modeler</span>
              </div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-white">
                Ledger Flow Recovery Probability Estimator
              </h2>
              <p className="text-[10px] text-white/40 uppercase">Calculate recovery success probabilities based on tracing variables</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sliders and inputs */}
              <div className="space-y-4">
                {/* Amount input */}
                <div className="space-y-1.5 font-mono text-[10px] uppercase text-white/70">
                  <div className="flex justify-between font-bold">
                    <span>Audit Amount</span>
                    <span className="text-cyan-400">{formatINR(estAmount)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="1500000" 
                    step="25000"
                    value={estAmount} 
                    onChange={(e) => setEstAmount(parseInt(e.target.value))}
                    className="w-full accent-white bg-white/10 cursor-pointer h-1 rounded-lg"
                  />
                </div>

                {/* Bank Select */}
                <div className="space-y-1.5 font-mono text-[10px] uppercase text-white/70">
                  <label className="block text-white/40">Partner Bank Gateway</label>
                  <select 
                    value={estBank}
                    onChange={(e) => setEstBank(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[10px] focus:outline-none focus:border-white/30 uppercase cursor-pointer"
                  >
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="HDFC Bank Ltd">HDFC Bank Ltd</option>
                    <option value="ICICI Bank Ltd">ICICI Bank Ltd</option>
                    <option value="Axis Bank Ltd">Axis Bank Ltd</option>
                  </select>
                </div>

                {/* Hops slider */}
                <div className="space-y-1.5 font-mono text-[10px] uppercase text-white/70">
                  <div className="flex justify-between font-bold">
                    <span>Transaction Layers (Hops)</span>
                    <span className="text-cyan-400">{estHops} Layers</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    value={estHops} 
                    onChange={(e) => setEstHops(parseInt(e.target.value))}
                    className="w-full accent-white bg-white/10 cursor-pointer h-1 rounded-lg"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 font-mono">
                    <span>1: Direct Mule</span>
                    <span>4: Layered Shells</span>
                  </div>
                </div>

                {/* Urgency selection */}
                <div className="space-y-1.5 font-mono text-[10px] uppercase text-white/70">
                  <label className="block text-white/40">Action Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setEstUrgency("ROUTINE")}
                      className={`py-2 border font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                        estUrgency === "ROUTINE" 
                          ? "bg-white text-black border-white shadow-md shadow-white/5" 
                          : "bg-transparent text-white/60 border-white/10 hover:bg-white/5"
                      }`}
                    >
                      Routine Hold
                    </button>
                    <button 
                      onClick={() => setEstUrgency("IMMEDIATE")}
                      className={`py-2 border font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                        estUrgency === "IMMEDIATE" 
                          ? "bg-white text-black border-white shadow-md shadow-white/5" 
                          : "bg-transparent text-white/60 border-white/10 hover:bg-white/5"
                      }`}
                    >
                      Immediate Escrow
                    </button>
                  </div>
                </div>
              </div>

              {/* Estimate results display */}
              <div className="border border-white/5 bg-[#080808]/80 p-5 rounded-xl flex flex-col justify-between space-y-4">
                <span className="text-[8px] text-white/40 font-mono tracking-widest uppercase font-bold">SIMULATION FORENSIC SUMMARY</span>
                
                <div className="space-y-4 my-auto">
                  <div className="text-center">
                    <span className="text-[10px] text-white/40 uppercase font-mono block">Estimated Success Probability</span>
                    <h4 className="text-4xl font-light font-mono text-emerald-400 mt-1">{calculateRecoveryProbability()}%</h4>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono uppercase text-white/50 border-t border-white/5 pt-3">
                    <div className="flex justify-between">
                      <span>HOLD INITIATION DELAY:</span>
                      <span className="text-white font-bold">{calculateHoldTime()} SECONDS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LEGAL AUTHORIZATION:</span>
                      <span className="text-emerald-400 font-bold">SUB-SECTION 62 APPROVED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RECOVERY PROTOCOL:</span>
                      <span className="text-white font-bold">AUTODISPATCH LIEN</span>
                    </div>
                  </div>
                </div>

                <div className="text-[8px] text-white/30 font-mono uppercase text-center leading-relaxed">
                  These estimates align with current response metrics from NPCI & 6 participating public sector banks.
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Emergency Bulk Action Dispatcher */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div>
              <div className="flex items-center gap-1.5 text-rose-500 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Administrative Control</span>
              </div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-white">
                Emergency Bulk Ledger freeze dispatcher
              </h2>
              <p className="text-[10px] text-white/40 uppercase">Broadcast debit holds across all flagged suspect nodes simultaneously</p>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed uppercase font-mono">
              In cases of massive smurfing, investigators may dispatch bulk holds to freeze all outgoing ledger transfers in parallel across SBI, PNB, BOB, HDFC, ICICI, and Axis servers.
            </p>

            <button
              onClick={handleRunBulkHold}
              disabled={isBulkHolding}
              className="px-5 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>{isBulkHolding ? "Dispatched bulk hold in progress..." : "Initiate Emergency Bulk Hold"}</span>
            </button>

            {/* Hold log */}
            {(bulkLog.length > 0 || isBulkHolding) && (
              <div className="border border-white/5 bg-[#080808]/80 p-4 rounded-xl font-mono text-[9px] uppercase tracking-wider space-y-2 max-h-[140px] overflow-y-auto">
                {bulkLog.map((log, index) => (
                  <div key={index} className="text-white/60 leading-normal">
                    {log}
                  </div>
                ))}
                {isBulkHolding && (
                  <div className="text-rose-400 animate-pulse">
                    Broadcasting ledger freeze signatures...
                  </div>
                )}
                {bulkSuccess && (
                  <div className="text-emerald-400 font-bold border-t border-white/5 pt-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SUCCESS: EMERGENCY DISPATCH CONCLUDED. ALL DIRECT OUTBOUND LEEDS LOCKDOWN INITIATED.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Live Debit-Held Node List */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Debit-Held Ledger Registry</h3>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Flagged accounts pending recovery</p>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/30" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bank/holder..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-[9px] font-mono focus:outline-none focus:border-white/30 text-white placeholder-white/20 uppercase"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
              {filteredNodes.map((node, i) => (
                <div key={i} className="bg-[#080808]/80 border border-white/5 p-3 rounded-xl font-mono text-[10px] uppercase space-y-1 hover:border-white/10 transition-colors">
                  <div className="flex justify-between font-bold">
                    <span className="text-white truncate max-w-[130px]">{node.destHolder}</span>
                    <span className="text-rose-400">{formatINR(node.amount)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-white/40">
                    <span>{getBankName(node.destAccount)}</span>
                    <span>{node.destAccount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] pt-1.5 border-t border-white/5 text-white/30 mt-1">
                    <span>Mule Level: {node.type}</span>
                    <span className={`font-bold ${node.status === "BLOCKED" ? "text-rose-400" : "text-amber-400"}`}>
                      {node.status === "BLOCKED" ? "FROZEN" : "UNRESOLVED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

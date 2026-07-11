import React, { useState } from "react";
import { 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  ArrowUpRight, 
  HelpCircle, 
  User, 
  Banknote, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Eye, 
  ShieldAlert as FreezeIcon, 
  Cpu, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Sliders, 
  Download, 
  Database, 
  Lock, 
  Check, 
  Info,
  Search,
  FileSpreadsheet
} from "lucide-react";
import { RiskLevel } from "../types";
import ActiveAlertsPage from "./ActiveAlertsPage";
import FlaggedFundsPage from "./FlaggedFundsPage";
import AvgRiskProfilePage from "./AvgRiskProfilePage";
import SecureInterfacesPage from "./SecureInterfacesPage";
import CsvUploader from "./CsvUploader";

export default function DashboardView({ alerts, onAlertAction, onSelectAlert, onGoToTab }) {
  const [filterType, setFilterType] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  
  // Interactive Quick Filters Linked to KPI Cards
  const [activeQuickFilter, setActiveQuickFilter] = useState("ALL");

  // Selected Tile Details Page State
  const [selectedTilePage, setSelectedTilePage] = useState("NONE");

  // Interactive Modal States
  const [isDirectivesModalOpen, setIsDirectivesModalOpen] = useState(false);
  const [isBankSyncModalOpen, setIsBankSyncModalOpen] = useState(false);
  const [isSyncingBanks, setIsSyncingBanks] = useState(false);
  const [simulatedDownloadSuccess, setSimulatedDownloadSuccess] = useState(false);

  // Bank Latency Data State
  const [bankSyncData, setBankSyncData] = useState([
    { id: "sbi", name: "State Bank of India", prefix: "SBI", latency: 14, status: "SECURE", nodeCount: 142 },
    { id: "pnb", name: "Punjab National Bank", prefix: "PNB", latency: 22, status: "SECURE", nodeCount: 89 },
    { id: "bob", name: "Bank of Baroda", prefix: "BOB", latency: 19, status: "SECURE", nodeCount: 74 },
    { id: "hdfc", name: "HDFC Bank Ltd", prefix: "HDFC", latency: 11, status: "SECURE", nodeCount: 115 },
    { id: "icici", name: "ICICI Bank Ltd", prefix: "ICICI", latency: 13, status: "SECURE", nodeCount: 98 },
    { id: "axis", name: "Axis Bank Ltd", prefix: "AXIS", latency: 17, status: "SECURE", nodeCount: 82 }
  ]);

  // Dynamic Rule Simulator States
  const [activeRuleId, setActiveRuleId] = useState(null);
  const [simDormancyDays, setSimDormancyDays] = useState(120);
  const [simTxFrequencySecs, setSimTxFrequencySecs] = useState(45);
  const [simGeographicDispersalKms, setSimGeographicDispersalKms] = useState(450);
  const [simTxCountInWindow, setSimTxCountInWindow] = useState(5);

  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Filter alerts based on traditional drop downs AND interactive KPI quick filters
  let processedAlerts = [...alerts];

  if (filterType !== "ALL") {
    processedAlerts = processedAlerts.filter(alert => alert.type === filterType);
  }
  if (riskFilter !== "ALL") {
    processedAlerts = processedAlerts.filter(alert => alert.riskLevel === riskFilter);
  }

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    processedAlerts = processedAlerts.filter(alert => 
      alert.id.toLowerCase().includes(q) ||
      alert.sourceHolder.toLowerCase().includes(q) ||
      alert.destHolder.toLowerCase().includes(q) ||
      (alert.sourceAccount && alert.sourceAccount.toLowerCase().includes(q)) ||
      (alert.destAccount && alert.destAccount.toLowerCase().includes(q))
    );
  }

  // Apply Quick Filter State from Cards
  if (activeQuickFilter === "ACTIVE") {
    processedAlerts = processedAlerts.filter(alert => alert.status === "NEW" || alert.status === "INVESTIGATING");
  } else if (activeQuickFilter === "HIGH_RISK") {
    processedAlerts = processedAlerts.filter(alert => alert.riskScore >= 75);
  } else if (activeQuickFilter === "HIGH_AMOUNT") {
    processedAlerts.sort((a, b) => b.amount - a.amount);
  }

  // KPI Calculations
  const activeAlertsCount = alerts.filter(a => a.status === "NEW" || a.status === "INVESTIGATING").length;
  const criticalAlertsCount = alerts.filter(a => a.riskLevel === RiskLevel.CRITICAL).length;
  const totalFlaggedFunds = alerts.reduce((acc, curr) => acc + curr.amount, 0);
  const averageRiskScore = Math.round(alerts.reduce((acc, curr) => acc + curr.riskScore, 0) / (alerts.length || 1));

  // Custom formatted Indian Rupees
  const formatRupees = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Simulates refreshing the bank gateway status APIs
  const handleRefreshBankGateways = () => {
    setIsSyncingBanks(true);
    setTimeout(() => {
      setBankSyncData(prev => prev.map(bank => ({
        ...bank,
        latency: Math.floor(8 + Math.random() * 22),
        nodeCount: bank.nodeCount + Math.floor(Math.random() * 4) - 1
      })));
      setIsSyncingBanks(false);
    }, 1200);
  };

  // Simulated PDF download handler
  const handleDownloadPDF = () => {
    setSimulatedDownloadSuccess(true);
    setTimeout(() => setSimulatedDownloadSuccess(false), 3000);
  };

  // Simulated dynamic risk score calculation inside the rules engine simulator
  const calculateSimulatedRisk = () => {
    let base = 20;
    // Longer dormancy period increases risk weight
    if (simDormancyDays > 90) base += 25;
    else if (simDormancyDays > 30) base += 10;

    // Faster exfiltration frequency increases risk weight
    if (simTxFrequencySecs < 30) base += 30;
    else if (simTxFrequencySecs < 120) base += 15;

    // More rapid transactions in brief window increases risk
    if (simTxCountInWindow >= 7) base += 25;
    else if (simTxCountInWindow >= 4) base += 15;

    // Larger geographic dispersal increases risk
    if (simGeographicDispersalKms > 800) base += 20;
    else if (simGeographicDispersalKms > 200) base += 10;

    return Math.min(100, base);
  };

  const currentSimulatedRisk = calculateSimulatedRisk();

  if (selectedTilePage === "ACTIVE_ALERTS") {
    return (
      <ActiveAlertsPage 
        alerts={alerts} 
        onBack={() => setSelectedTilePage("NONE")} 
        onSelectAlert={onSelectAlert}
        onAlertAction={onAlertAction}
      />
    );
  }

  if (selectedTilePage === "FLAGGED_FUNDS") {
    return (
      <FlaggedFundsPage 
        alerts={alerts} 
        onBack={() => setSelectedTilePage("NONE")} 
      />
    );
  }

  if (selectedTilePage === "AVG_RISK") {
    return (
      <AvgRiskProfilePage 
        alerts={alerts} 
        onBack={() => setSelectedTilePage("NONE")} 
        onSelectAlert={onSelectAlert}
        onAlertAction={onAlertAction}
      />
    );
  }

  if (selectedTilePage === "SECURE_INTERFACES") {
    return (
      <SecureInterfacesPage 
        onBack={() => setSelectedTilePage("NONE")} 
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Filter Info Bar */}
      {activeQuickFilter !== "ALL" && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 p-3.5 font-mono text-[10px] uppercase tracking-widest flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            <span>Active Quick Filter: <strong>{activeQuickFilter === "ACTIVE" ? "ACTIVE & INVESTIGATING" : activeQuickFilter === "HIGH_RISK" ? "HIGH RISK (>=75%)" : "SORTED BY AMOUNT DESCENDING"}</strong></span>
          </div>
          <button 
            onClick={() => setActiveQuickFilter("ALL")}
            className="underline underline-offset-4 font-bold hover:text-white"
          >
            Clear Filter [X]
          </button>
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* KPI 1: Active Alerts (Interactive Filter) */}
        <div 
          onClick={() => setSelectedTilePage("ACTIVE_ALERTS")}
          className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 relative group shadow-xl shadow-black/40"
          title="Click to view Active Alerts forensic center"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">ACTIVE ALERTS</span>
            <span className="p-2 rounded-xl border border-white/10 bg-white/5 text-white">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-4xl font-light font-mono text-white">{activeAlertsCount}</h3>
            <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-3 font-mono uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{criticalAlertsCount} CRITICAL LEVEL</span>
            </p>
          </div>
          <div className="absolute bottom-3 right-4 text-[8px] font-mono text-white/20 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            [OPEN FORENSICS →]
          </div>
        </div>

        {/* KPI 2: Flagged Funds (Interactive Sort) */}
        <div 
          onClick={() => setSelectedTilePage("FLAGGED_FUNDS")}
          className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 relative group shadow-xl shadow-black/40"
          title="Click to view Flagged Funds ledger center"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">FLAGGED FUNDS</span>
            <span className="p-2 rounded-xl border border-white/10 bg-white/5 text-white">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-3xl font-light font-mono text-white">
              {formatRupees(totalFlaggedFunds)}
            </h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-3 font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>78% TRACED & RECOVERABLE</span>
            </p>
          </div>
          <div className="absolute bottom-3 right-4 text-[8px] font-mono text-white/20 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            [OPEN LEDGER AUDIT →]
          </div>
        </div>

        {/* KPI 3: Avg Risk Profile (Interactive Filter) */}
        <div 
          onClick={() => setSelectedTilePage("AVG_RISK")}
          className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 relative group shadow-xl shadow-black/40"
          title="Click to view Avg Risk Profile analytics suite"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">AVG RISK PROFILE</span>
            <span className="p-2 rounded-xl border border-white/10 bg-white/5 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-4xl font-light font-mono text-cyan-400">{averageRiskScore}%</h3>
            <div className="h-1 w-full bg-white/5 mt-4 overflow-hidden rounded-full">
              <div className="h-full bg-cyan-400" style={{ width: `${averageRiskScore}%` }}></div>
            </div>
            <p className="text-[10px] text-white/30 mt-2 font-mono uppercase tracking-wider">
              FLOWS AUDITED // HIGH-DENSITY
            </p>
          </div>
          <div className="absolute bottom-3 right-4 text-[8px] font-mono text-white/20 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            [OPEN RISK ANALYSIS →]
          </div>
        </div>

        {/* KPI 4: Secure Interfaces (Interactive Modal Open) */}
        <div 
          onClick={() => setSelectedTilePage("SECURE_INTERFACES")}
          className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 relative group shadow-xl shadow-black/40"
          title="Click to view Secure Gateways connection hub"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">SECURE INTERFACES</span>
            <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-4xl font-light font-mono text-white">6 BANKS</h3>
            <p className="text-[10px] text-white/40 flex items-center gap-1 mt-3 font-mono uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">100% REGULATORY SYNC</span>
            </p>
          </div>
          <div className="absolute bottom-3 right-4 text-[8px] font-mono text-white/20 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            [OPEN GATEWAYS →]
          </div>
        </div>
      </div>

      {/* Main Content Split: Alerts Panel and Interactive Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Alerts Feed */}
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden flex flex-col">
          {/* Header & Filters */}
          <div className="px-8 py-6 border-b border-white/10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-[#080808]/40">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white">Live Suspicious Activity Feeds</h2>
              <p className="text-xs text-white/40 font-mono">Real-time money mule heuristics triggers requiring review</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[180px] sm:flex-none">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/40">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search holder, account, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 bg-[#080808] border border-white/10 text-white placeholder-white/30 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 font-mono transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-white/40 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Upload CSV Trigger Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#080808] border border-white/10 text-white/80 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-white/30 font-mono uppercase tracking-wider"
              >
                <option value="ALL">All Heuristics</option>
                <option value="RAPID_CHAIN">Rapid Chain</option>
                <option value="DORMANT_AWAKENING">Dormant Awakening</option>
                <option value="VELOCITY_SPIKE">Velocity Spike</option>
                <option value="SMURF_FUNNEL">Smurf Funnel</option>
              </select>

              {/* Risk Filter */}
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-[#080808] border border-white/10 text-white/80 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-white/30 font-mono uppercase tracking-wider"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High & Critical</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>

          {/* Alerts Feed List */}
          <div className="divide-y divide-white/10 overflow-y-auto max-h-[500px] flex-1">
            {processedAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <ShieldCheck className="w-10 h-10 text-white/20 mb-3" />
                <p className="text-white/60 text-sm font-mono uppercase tracking-widest">No matching security alerts found.</p>
                <p className="text-white/30 text-xs font-mono mt-1 uppercase tracking-wider">All gateway systems operating within optimal margins.</p>
              </div>
            ) : (
              processedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="px-8 py-5 hover:bg-white/[0.02] transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Dot / Indicator */}
                    <div className="mt-1.5">
                      {alert.status === "BLOCKED" ? (
                        <span className="flex h-2.5 w-2.5 bg-slate-500" title="Transaction Blocked"></span>
                      ) : alert.status === "RESOLVED" ? (
                        <span className="flex h-2.5 w-2.5 bg-emerald-500" title="Resolved / Whitelisted"></span>
                      ) : alert.riskLevel === RiskLevel.CRITICAL ? (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-pulse absolute inline-flex h-full w-full bg-rose-500"></span>
                          <span className="relative inline-flex h-3 w-3 bg-rose-500"></span>
                        </span>
                      ) : alert.riskLevel === RiskLevel.HIGH ? (
                        <span className="flex h-2.5 w-2.5 bg-amber-500"></span>
                      ) : (
                        <span className="flex h-2 w-2 bg-cyan-400"></span>
                      )}
                    </div>

                    {/* Alert Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-white/40 font-bold">{alert.id}</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{alert.destHolder}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-none font-mono bg-white/5 text-white/60 border border-white/10 uppercase tracking-widest">
                          {alert.type.replace("_", " ")}
                        </span>
                        {alert.status && (
                          <span className={`text-[8px] px-1.5 py-0.2 rounded-none font-mono uppercase tracking-widest border ${
                            alert.status === "BLOCKED" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : 
                            alert.status === "INVESTIGATING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {alert.status}
                          </span>
                        )}
                      </div>

                      {/* Path Representation */}
                      <p className="text-xs text-white/40 flex items-center gap-1.5 flex-wrap">
                        <span className="text-white/30 font-mono text-[11px]">{alert.sourceHolder}</span>
                        <ArrowRight className="w-3 h-3 text-white/20" />
                        <span className="text-white/80 font-bold uppercase tracking-wide">{alert.destHolder}</span>
                      </p>

                      {/* Financial info */}
                      <div className="flex items-center gap-4 text-[11px] text-white/40 font-mono uppercase tracking-wider">
                        <span>Amt: <strong className="text-white font-sans">{formatRupees(alert.amount)}</strong></span>
                        <span>Risk: <strong className="text-rose-400">{alert.riskScore}%</strong></span>
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAlertAction(alert, "trace");
                      }}
                      className="px-4 py-2 bg-white text-black hover:bg-white/90 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Trace Path</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAlertAction(alert, "block");
                      }}
                      disabled={alert.status === "BLOCKED"}
                      className="px-4 py-2 bg-white/5 text-white disabled:opacity-30 disabled:hover:bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FreezeIcon className="w-3.5 h-3.5" />
                      <span>{alert.status === "BLOCKED" ? "Frozen" : "Freeze"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Column: Trace Summary Insight Card */}
        <div className="space-y-6">
          {/* Diagnostic Heuristics */}
          <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-black/40">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Heuristic Detection Rules</span>
            </h3>
            <p className="text-xs text-white/40 font-mono mt-1">Click a rule below to open the parameter simulator</p>

            <div className="mt-6 space-y-5">
              {/* Rule 1 */}
              <div 
                onClick={() => {
                  setActiveRuleId("dormant-awakening");
                  setSimDormancyDays(120);
                  setSimTxFrequencySecs(45);
                }}
                className="space-y-1.5 cursor-pointer p-2.5 border border-transparent hover:border-white/10 hover:bg-white/[0.02] rounded-xl transition-all group"
              >
                <div className="flex justify-between text-xs font-mono uppercase">
                  <span className="text-white/70 group-hover:text-cyan-400 transition-colors">Dormant Awakening Heuristics</span>
                  <span className="text-rose-400 font-bold">95% Weight</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: "95%" }}></div>
                </div>
                <p className="text-[10px] text-white/30 font-mono">Triggers if idle period &gt;90 days meets immediate UPI exfiltration under 2 minutes. [SIMULATE]</p>
              </div>

              {/* Rule 2 */}
              <div 
                onClick={() => {
                  setActiveRuleId("rapid-splitting");
                  setSimTxCountInWindow(6);
                  setSimTxFrequencySecs(30);
                }}
                className="space-y-1.5 cursor-pointer p-2.5 border border-transparent hover:border-white/10 hover:bg-white/[0.02] rounded-xl transition-all group"
              >
                <div className="flex justify-between text-xs font-mono uppercase">
                  <span className="text-white/70 group-hover:text-cyan-400 transition-colors">Rapid Multi-Splitting (Smurfing)</span>
                  <span className="text-amber-400 font-bold">82% Weight</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: "82%" }}></div>
                </div>
                <p className="text-[10px] text-white/30 font-mono">Inbound funds instantly disbursed to 3+ unique destination nodes under 180s. [SIMULATE]</p>
              </div>

              {/* Rule 3 */}
              <div 
                onClick={() => {
                  setActiveRuleId("device-swapping");
                  setSimGeographicDispersalKms(850);
                }}
                className="space-y-1.5 cursor-pointer p-2.5 border border-transparent hover:border-white/10 hover:bg-white/[0.02] rounded-xl transition-all group"
              >
                <div className="flex justify-between text-xs font-mono uppercase">
                  <span className="text-white/70 group-hover:text-cyan-400 transition-colors">Device Fingerprint Swapping</span>
                  <span className="text-cyan-400 font-bold">45% Weight</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: "45%" }}></div>
                </div>
                <p className="text-[10px] text-white/30 font-mono">Same account login across disparate IMEI devices within extreme geographical speed. [SIMULATE]</p>
              </div>
            </div>
          </div>

          {/* Quick Informational Guide */}
          <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-black/40">
            <h3 className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Investigator Guideline</h3>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-2">Mule Account Freezing Protocol (PSB-62)</h4>
            <p className="text-xs text-white/40 mt-3 leading-relaxed">
              Upon detecting a high-velocity laundering chain, regulatory mandate requires instant coordination with partner receiving banks. Tracing the path to Layer 2 and 3 nodes allows freezing final exit points (ATM/Crypto) to preserve victim funds.
            </p>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono uppercase">
              <span className="text-white/30">Source: National AML</span>
              <button
                onClick={() => setIsDirectivesModalOpen(true)}
                className="text-white underline underline-offset-4 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono uppercase"
              >
                <span>Read Directives</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: LIVE PUBLIC SECTOR BANK INTERFACES PORTAL */}
      {isBankSyncModalOpen && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#080808]">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Public Sector Bank Gateway Sync</h3>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Live API Connection Status with Public & Private Gateways</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBankSyncModalOpen(false)}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Table */}
            <div className="p-6 overflow-y-auto max-h-[400px] space-y-4">
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Below are the active REST API gateways configured for Indian public-sector ledger synchronization. Triggers generated on our neural network dispatch sub-second payloads to these nodes to execute multi-bank holds on mule accounts under the <strong>1930 Cyber Cell Directive</strong>.
              </p>

              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#080808]">
                <table className="w-full text-left font-mono text-[10px] uppercase">
                  <thead className="bg-white/5 text-white/40 text-[9px] border-b border-white/10 font-bold tracking-widest">
                    <tr>
                      <th className="p-3">Gateway Entity</th>
                      <th className="p-3">API Latency</th>
                      <th className="p-3">Active Ledger Nodes</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {bankSyncData.map((bank) => (
                      <tr key={bank.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-bold text-white">
                          {bank.name} ({bank.prefix})
                        </td>
                        <td className="p-3 text-cyan-400 font-bold">
                          {bank.latency} ms
                        </td>
                        <td className="p-3 text-white/50">
                          {bank.nodeCount} active threads
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-lg font-bold">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></span>
                            <span>{bank.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Control Panel */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#080808] flex items-center justify-between">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                Last updated: Just Now (UPI-2.0 Secure)
              </div>
              <button
                onClick={handleRefreshBankGateways}
                disabled={isSyncingBanks}
                className="px-4 py-2 bg-white text-black hover:bg-white/90 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all rounded-xl cursor-pointer shadow-lg shadow-white/5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBanks ? "animate-spin" : ""}`} />
                <span>{isSyncingBanks ? "Querying Latencies..." : "Force Gateway Sync"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL INVESTIGATOR GUIDELINES (RBI DIRECTIVES) */}
      {isDirectivesModalOpen && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#080808]">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">National AML Circular & SOP (PSB-62)</h3>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Reserve Bank of India Compliance Desk • Confidential Document</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDirectivesModalOpen(false)}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto max-h-[420px] space-y-6 text-white/80 select-text font-serif leading-relaxed text-xs">
              <div className="border-b border-white/10 pb-4 text-center">
                <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold mb-1">DEPARTMENT OF FINANCIAL REGULATION (AML-CFT CELL)</div>
                <div className="text-sm font-sans font-black uppercase text-white tracking-wider">CIRCULAR REF: RBI/2024-25/112/DFS-MULE</div>
                <div className="text-[9px] font-mono text-white/40 uppercase mt-0.5">DATED: JULY 09, 2026 • STRICT COMPLIANCE MANDATED</div>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider">1. PURPOSE & PRINCIPLE OF HOLD ACTION:</h4>
                <p className="text-white/70 leading-relaxed">
                  To secure public sector accounts from the malicious siphonage of online scam proceeds. Upon identification of sudden "rapid chains" (smurfing/layering) wherein single inbound credits are disbursed immediately into secondary and tertiary accounts within a 180-second window, the source and receiving nodes MUST be flagged instantly.
                </p>

                <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider">2. EXTRALIMITARY MANDATORY ACTIONS (SOP PSB-62):</h4>
                <ul className="list-disc pl-5 space-y-2 font-sans text-[11px] text-white/70 leading-relaxed">
                  <li><strong>Instantaneous Debiting Block:</strong> Financial holdings must freeze debit capabilities of suspected mule accounts within 5 minutes of verification to prevent exfiltration at ATMs or Crypto exchanges.</li>
                  <li><strong>Cross-Bank Integration:</strong> Inbound pathways must trace the origin network. If origin is a different commercial entity, API calls must initiate automated holding warnings.</li>
                  <li><strong>National Database Registration:</strong> Device IMEI and linked mobile numbers must be compiled into the Central Cyber-Security Mule Index to secure national banking infrastructure against recurring offenses.</li>
                </ul>

                <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider">3. PENALTIES FOR DELAYED DISPATCH:</h4>
                <p className="italic text-white/60 leading-relaxed">
                  Non-compliance or failure to block downstream flows after receipt of clear trace indications of Layer-1 smurfing makes the holding entity liable for regulatory warning or compensatory restitution under Section 12 of the Prevention of Money Laundering Act (PMLA).
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#080808] flex items-center justify-between">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
              >
                {simulatedDownloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Circular_PSB62.pdf Saved</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-white/40" />
                    <span>Download Circular PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsDirectivesModalOpen(false)}
                className="px-5 py-2.5 bg-white text-black hover:bg-white/90 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-white/5"
              >
                Acknowledge Directive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INTERACTIVE HEURISTIC DETECTOR RULES SIMULATOR */}
      {activeRuleId && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#080808]">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Heuristics Logic Simulator</h3>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Adjust behavioral boundaries & view real-time risk calculations</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveRuleId(null)}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive sliders & meters */}
            <div className="p-6 space-y-6">
              <div className="bg-[#080808]/80 border border-white/10 p-5 rounded-xl text-center shadow-inner">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block mb-1">Dynamic Score Weight Output</span>
                <div className={`text-4xl font-bold font-mono tracking-tight ${
                  currentSimulatedRisk >= 75 ? "text-rose-400 animate-pulse" : currentSimulatedRisk >= 45 ? "text-amber-400" : "text-cyan-400"
                }`}>
                  {currentSimulatedRisk}% RISK RATIO
                </div>
                <div className="w-full bg-white/5 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      currentSimulatedRisk >= 75 ? "bg-rose-500" : currentSimulatedRisk >= 45 ? "bg-amber-400" : "bg-cyan-400"
                    }`}
                    style={{ width: `${currentSimulatedRisk}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest mt-2.5">
                  {currentSimulatedRisk >= 75 ? "⚠️ HIGH PROBABILITY LAUNDERING ALIGNMENT" : "Optimal range // compliant profile"}
                </p>
              </div>

              {/* Sliders container */}
              <div className="space-y-4 font-mono text-[10px] uppercase">
                {/* Dormancy days */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-white/70">
                    <span>Pre-Awakening Dormancy Days</span>
                    <span className="text-cyan-400">{simDormancyDays} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="365" 
                    value={simDormancyDays} 
                    onChange={(e) => setSimDormancyDays(parseInt(e.target.value))}
                    className="w-full accent-white bg-white/10 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[8px] text-white/30">
                    <span>Active Account</span>
                    <span>Extreme Dormant (Suspicious)</span>
                  </div>
                </div>

                {/* Exfiltration velocity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-white/70">
                    <span>Inbound to Outbound Velocity Time-gap</span>
                    <span className="text-cyan-400">{simTxFrequencySecs} Seconds</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="600" 
                    value={simTxFrequencySecs} 
                    onChange={(e) => setSimTxFrequencySecs(parseInt(e.target.value))}
                    className="w-full accent-white bg-white/10 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[8px] text-white/30">
                    <span>Rapid Burst (Hold triggered)</span>
                    <span>Standard spacing</span>
                  </div>
                </div>

                {/* Number of tx in window */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-white/70">
                    <span>Concurrent recipients in window</span>
                    <span className="text-cyan-400">{simTxCountInWindow} Unique accounts</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    value={simTxCountInWindow} 
                    onChange={(e) => setSimTxCountInWindow(parseInt(e.target.value))}
                    className="w-full accent-white bg-white/10 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[8px] text-white/30">
                    <span>Simple transfer</span>
                    <span>Layering dispersion (Mule cluster)</span>
                  </div>
                </div>

                {/* Geographic dispersal */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-white/70">
                    <span>IP Location radius gap</span>
                    <span className="text-cyan-400">{simGeographicDispersalKms} Kilometers</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="2000" 
                    value={simGeographicDispersalKms} 
                    onChange={(e) => setSimGeographicDispersalKms(parseInt(e.target.value))}
                    className="w-full accent-white bg-white/10 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[8px] text-white/30">
                    <span>Local ISP</span>
                    <span>Impossible speed (Travel velocity swap)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#080808] flex items-center justify-between">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                Simulator node: Sandboxed
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSimDormancyDays(14);
                    setSimTxFrequencySecs(450);
                    setSimTxCountInWindow(1);
                    setSimGeographicDispersalKms(12);
                  }}
                  className="px-3.5 py-2 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  Reset Sliders
                </button>
                <button
                  onClick={() => {
                    setActiveRuleId(null);
                  }}
                  className="px-4 py-2 bg-white text-black hover:bg-white/90 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-white/5"
                >
                  Apply Parameters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Uploader Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#080808]">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Bulk CSV Threat Detector</h3>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">AML Money Laundering Compliance Heuristics Processor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <CsvUploader 
                onGoToDashboard={() => setIsUploadModalOpen(false)}
                onLoadToScratchpad={() => {
                  if (onGoToTab) {
                    onGoToTab("sandbox");
                  }
                  setIsUploadModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

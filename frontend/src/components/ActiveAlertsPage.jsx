import React, { useState } from "react";
import { 
  ShieldAlert, 
  ArrowLeft, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Eye, 
  Ban, 
  Sparkles, 
  RefreshCw,
  Clock,
  Sliders,
  Filter
} from "lucide-react";

export default function ActiveAlertsPage({ 
  alerts, 
  onBack, 
  onSelectAlert, 
  onAlertAction 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bankFilter, setBankFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [neuralThreshold, setNeuralThreshold] = useState(70);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLog, setScanLog] = useState([]);
  const [scannedCount, setScannedCount] = useState(0);

  // Statistics
  const totalAlerts = alerts.length;
  const newAlertsCount = alerts.filter(a => a.status === "NEW").length;
  const blockedAlertsCount = alerts.filter(a => a.status === "BLOCKED").length;
  const criticalAlertsCount = alerts.filter(a => a.riskScore >= 85).length;

  // Filter logic
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.destHolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.destAccount.includes(searchQuery) ||
      alert.sourceHolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = 
      severityFilter === "ALL" || 
      (severityFilter === "CRITICAL" && alert.riskScore >= 85) ||
      (severityFilter === "HIGH" && alert.riskScore >= 70 && alert.riskScore < 85) ||
      (severityFilter === "MEDIUM" && alert.riskScore < 70);

    return matchesSearch && matchesSeverity;
  });

  // Simulated automated scan
  const handleStartScan = () => {
    setIsScanning(true);
    setScanLog([]);
    setScannedCount(0);
    
    const messages = [
      "Initializing AI neural threat engine...",
      "Querying unified central bank database registries...",
      "Matching device fingerprints with known cyber hubs...",
      "Analysing dormant account velocity spikes...",
      "Flagging high-frequency sub-limit transaction streams...",
      "Heuristics scan complete: 4 nodes flagged with suspicious indicators."
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setScanLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${messages[index]}`]);
        setScannedCount(c => c + Math.floor(Math.random() * 450) + 120);
        index++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Back Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/40">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Go back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 font-mono border border-red-500/20 uppercase tracking-widest font-bold rounded-lg">
                FORENSIC HUB
              </span>
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">
                NODE SECURITY // LEVEL 4
              </span>
            </div>
            <h1 className="text-lg font-bold text-white uppercase tracking-widest font-sans mt-0.5">
              Active Threat Alerts Analytics
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-white/40">
          <span>SECURE PROTOCOL ACTIVE</span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase font-bold">TOTAL REGISTERED CASE ALERTS</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light font-mono text-white">{totalAlerts}</span>
            <span className="text-[10px] text-white/30 font-mono">ACTIVE ENTITIES</span>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-[#ff4d4d]/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-rose-400/80 font-mono tracking-widest uppercase font-bold">CRITICAL SEVERITY (RATING &gt; 85%)</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light font-mono text-rose-400">{criticalAlertsCount}</span>
            <span className="text-[10px] text-rose-400/40 font-mono">NODES OUTBOUND</span>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-emerald-400/80 font-mono tracking-widest uppercase font-bold">REGULATORY HOLD ACTIONS ENFORCED</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light font-mono text-emerald-400">{blockedAlertsCount}</span>
            <span className="text-[10px] text-emerald-400/40 font-mono">ASSETS FROZEN</span>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-cyan-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-cyan-400/80 font-mono tracking-widest uppercase font-bold">PENDING ANALYST VERIFICATION</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light font-mono text-cyan-400">{newAlertsCount}</span>
            <span className="text-[10px] text-cyan-400/40 font-mono">NEW INBOX</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Filters & Interactive List */}
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-white">Alert Threat Index Feed</h2>
              <p className="text-[10px] text-white/40 mt-1 uppercase">Filter through active neural heuristic traces</p>
            </div>
            
            {/* Direct Filters */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-[#080808] border border-white/10 text-white text-[10px] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-white/30 font-mono uppercase tracking-wider cursor-pointer"
              >
                <option value="ALL">All Scores</option>
                <option value="CRITICAL">Critical (&gt;=85%)</option>
                <option value="HIGH">High (70%-84%)</option>
                <option value="MEDIUM">Medium (&lt;70%)</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suspect name, account number, source node, or alert hash..."
              className="w-full bg-[#080808] border border-white/10 text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-white/30 font-mono text-white placeholder-white/20"
            />
          </div>

          {/* Alerts Loop */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="border border-dashed border-white/10 p-12 text-center rounded-xl font-mono text-xs text-white/30 uppercase">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-white/10" />
                No matching threat triggers registered under active filter.
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className="bg-white/[0.02] border border-white/5 hover:border-white/15 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-white/40">#{alert.id}</span>
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${
                        alert.riskLevel === "CRITICAL" 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : alert.riskLevel === "HIGH" 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      }`}>
                        {alert.riskLevel}
                      </span>
                      <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider">{alert.type.replace("_", " ")}</span>
                    </div>

                    <div className="text-xs uppercase text-white font-bold">
                      {alert.destHolder} <span className="text-white/40 font-normal text-[10px]">({alert.destAccount})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] text-white/40">
                      <span>Source: <strong className="text-white/60">{alert.sourceHolder}</strong></span>
                      <span>Amount: <strong className="text-cyan-400">₹{alert.amount.toLocaleString("en-IN")}</strong></span>
                      <span>Status: <strong className={`${alert.status === "BLOCKED" ? "text-rose-400" : alert.status === "RESOLVED" ? "text-emerald-400" : "text-amber-400"}`}>{alert.status}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button 
                      onClick={() => onSelectAlert(alert)}
                      className="px-3.5 py-2 border border-white/10 hover:bg-white/5 text-[9px] font-mono text-white font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Audit Node
                    </button>
                    <button 
                      onClick={() => onAlertAction(alert, "trace")}
                      className="px-3.5 py-2 bg-white text-black hover:bg-white/90 text-[9px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Visualize Trail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Interactive Neural Configuration & Live Automated Scan */}
        <div className="space-y-6">
          {/* Section: Neural Threshold Control */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Neural Threat Filter Configuration</h3>
            </div>
            
            <p className="text-[9px] text-white/40 font-mono uppercase leading-relaxed">
              Adjusting the network risk threshold dynamically recalibrates suspicious transfer filters across public bank gateways.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between font-mono text-[10px] uppercase font-bold">
                <span className="text-white/60">Risk Margin Cut-off</span>
                <span className="text-cyan-400">{neuralThreshold}% Score</span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="95" 
                value={neuralThreshold}
                onChange={(e) => setNeuralThreshold(parseInt(e.target.value))}
                className="w-full accent-white bg-white/10 cursor-pointer h-1 rounded-lg"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase">
                <span>Sensitive (Catch More)</span>
                <span>Authoritative (Strict)</span>
              </div>
            </div>

            <div className="border border-white/5 bg-[#080808]/80 p-3.5 rounded-xl font-mono text-[9px] uppercase tracking-wider space-y-2">
              <div className="flex justify-between text-white/40">
                <span>Total Flagged under Threshold:</span>
                <span className="text-white font-bold">
                  {alerts.filter(a => a.riskScore >= neuralThreshold).length} accounts
                </span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Estimated False Positives:</span>
                <span className="text-emerald-400 font-bold">
                  {Math.max(0, Math.round((100 - neuralThreshold) * 0.15))}%
                </span>
              </div>
            </div>
          </div>

          {/* Section: Advanced Core Scanner */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Ad-hoc Forensic Search</h3>
              </div>
              {isScanning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
            </div>

            <p className="text-[9px] text-white/40 font-mono uppercase leading-relaxed">
              Trigger an on-demand Deep-Search across all current UPI transfer logs to surface unlogged sleeper chains.
            </p>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full py-2.5 bg-white text-black hover:bg-white/90 disabled:opacity-30 font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-xl cursor-pointer shadow-md"
            >
              {isScanning ? "Active Deep Search..." : "Execute Core Scanning Node"}
            </button>

            {/* Scan Activity Log */}
            {(scanLog.length > 0 || isScanning) && (
              <div className="border border-white/5 bg-[#080808]/80 p-4 rounded-xl font-mono text-[9px] uppercase tracking-wider space-y-2.5 max-h-[160px] overflow-y-auto">
                {scanLog.map((log, i) => (
                  <div key={i} className="text-white/60 leading-normal">
                    {log}
                  </div>
                ))}
                {isScanning && (
                  <div className="text-amber-400 animate-pulse">
                    Scanning block {scannedCount} addresses...
                  </div>
                )}
                {!isScanning && (
                  <div className="text-emerald-400 font-bold border-t border-white/5 pt-1.5 flex items-center gap-1">
                     <CheckCircle className="w-3.5 h-3.5" />
                    <span>SCAN COMPLETE. REGISTERED COMPLIANT.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Density Graph Visual Block */}
      <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/40">
        <div>
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white">UPI Forensic Threat Volume Density Over 24 Hours</h3>
          <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest mt-0.5">Distribution of money-laundering spikes within critical hours</p>
        </div>

        <div className="h-44 w-full relative flex items-end justify-between gap-1.5 pt-6 border-b border-l border-white/10 font-mono text-[8px] text-white/30 select-none px-4">
          <div className="absolute top-2 left-2 text-white/10 uppercase tracking-widest">
            Y-AXIS: HOURLY TRANSFER VELOCITY
          </div>
          <div className="absolute bottom-2 right-2 text-white/10 uppercase tracking-widest">
            X-AXIS: DAILY ROTATION TIMELINE (00:00 - 24:00)
          </div>

          {/* SVG representation of threat wave */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M 0 90 Q 15 15 30 50 T 60 20 T 90 70 T 100 90 L 100 100 L 0 100 Z" 
              fill="url(#waveGradient)" 
              stroke="#ff4d4d" 
              strokeWidth="0.75"
              strokeDasharray="1 1"
            />
            {/* Reference horizontal gridlines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeWidth="0.05" strokeDasharray="2 2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.05" strokeDasharray="2 2" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.05" strokeDasharray="2 2" />
          </svg>

          {/* Dynamic Interactive Pillars */}
          {[
            { hour: "02:00", height: "15%", alert: 1 },
            { hour: "04:00", height: "10%", alert: 0 },
            { hour: "06:00", height: "45%", alert: 2 },
            { hour: "08:00", height: "85%", alert: 5 },
            { hour: "10:00", height: "60%", alert: 3 },
            { hour: "12:00", height: "40%", alert: 1 },
            { hour: "14:00", height: "30%", alert: 2 },
            { hour: "16:00", height: "92%", alert: 6 },
            { hour: "18:00", height: "70%", alert: 4 },
            { hour: "20:00", height: "55%", alert: 3 },
            { hour: "22:00", height: "25%", alert: 1 },
            { hour: "24:00", height: "12%", alert: 0 }
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer">
              <div className="text-[7px] text-rose-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                {bar.alert} TX
              </div>
              <div 
                className="w-full bg-white/5 group-hover:bg-rose-500/25 transition-all border-t border-transparent group-hover:border-rose-400/30 rounded-t-sm"
                style={{ height: bar.height }}
              ></div>
              <span className="text-[7px] text-white/30 group-hover:text-white/60 font-mono mt-1.5 transition-colors">
                {bar.hour}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

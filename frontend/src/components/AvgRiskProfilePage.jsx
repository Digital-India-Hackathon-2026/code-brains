import React, { useState } from "react";
import { 
  TrendingUp, 
  ArrowLeft, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Sliders, 
  Database, 
  Sparkles, 
  Eye, 
  FileText, 
  Search,
  CheckCircle2,
  SlidersHorizontal,
  HelpCircle
} from "lucide-react";

export default function AvgRiskProfilePage({ 
  alerts, 
  onBack, 
  onSelectAlert, 
  onAlertAction 
}) {
  // Slider states for Risk Simulator
  const [simDormancyDays, setSimDormancyDays] = useState(90);
  const [simTxFrequencySecs, setSimTxFrequencySecs] = useState(30);
  const [simGeographicDispersalKms, setSimGeographicDispersalKms] = useState(550);
  const [simTxCountInWindow, setSimTxCountInWindow] = useState(6);

  // Selected risk density bar
  const [selectedRiskBar, setSelectedRiskBar] = useState(null);
  const [suspectSearch, setSuspectSearch] = useState("");

  const totalScanned = 1420;
  
  // Calculate simulated global risk index based on sliders
  const calculateSimulatedRisk = () => {
    let base = 25;
    if (simDormancyDays > 60) base += 20;
    if (simDormancyDays > 120) base += 10;
    
    if (simTxFrequencySecs < 45) base += 25;
    if (simTxFrequencySecs < 15) base += 15;

    if (simTxCountInWindow >= 6) base += 20;
    if (simGeographicDispersalKms > 600) base += 15;

    return Math.min(98, base);
  };

  const simulatedIndex = calculateSimulatedRisk();

  // Get active risk levels from real alerts
  const averageRisk = Math.round(alerts.reduce((acc, curr) => acc + curr.riskScore, 0) / (alerts.length || 1));

  // Risk distribution counts
  const riskGroups = {
    LOW: alerts.filter(a => a.riskScore < 50),
    MEDIUM: alerts.filter(a => a.riskScore >= 50 && a.riskScore < 70),
    HIGH: alerts.filter(a => a.riskScore >= 70 && a.riskScore < 85),
    CRITICAL: alerts.filter(a => a.riskScore >= 85)
  };

  const filteredSuspects = alerts.filter(alert => {
    const matchesSearch = alert.destHolder.toLowerCase().includes(suspectSearch.toLowerCase()) || alert.id.includes(suspectSearch);
    
    if (selectedRiskBar === "LOW") return matchesSearch && alert.riskScore < 50;
    if (selectedRiskBar === "MEDIUM") return matchesSearch && alert.riskScore >= 50 && alert.riskScore < 70;
    if (selectedRiskBar === "HIGH") return matchesSearch && alert.riskScore >= 70 && alert.riskScore < 85;
    if (selectedRiskBar === "CRITICAL") return matchesSearch && alert.riskScore >= 85;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 font-mono border border-cyan-500/20 uppercase tracking-widest font-bold rounded-lg">
                RISK ENGINE
              </span>
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">
                NEURAL SCORING & PATTERN SYNTHESIS
              </span>
            </div>
            <h1 className="text-lg font-bold text-white uppercase tracking-widest font-sans mt-0.5">
              Heuristics Risk Profile Suite
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-white/40">
          <span>CLASSIFICATION MATRIX: SECTIONS 62</span>
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Real Avg Risk Score</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-cyan-400">{averageRisk}%</h3>
            <p className="text-[9px] text-white/30 font-mono uppercase tracking-wider mt-1.5">Mean active network score</p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase font-bold">Sleeper Nodes Identified</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-white">{alerts.filter(a => a.type === "DORMANT_AWAKENING").length} Nodes</h3>
            <p className="text-[9px] text-rose-400 font-mono uppercase tracking-wider mt-1.5">Awaiting Immediate Freeze</p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Monitored Base Transactions</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-white">48,912 UPI/IMPS</h3>
            <p className="text-[9px] text-white/30 font-mono uppercase tracking-wider mt-1.5">Processed past 24 hours</p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
          <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Anomaly Density Factor</span>
          <div className="mt-4">
            <h3 className="text-3xl font-light font-mono text-white">0.024%</h3>
            <p className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider mt-1.5">Secured network core</p>
          </div>
        </div>
      </div>

      {/* Main Core Layout: Risk Curves and Rule Slider Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Risk Distribution Interactive Bar Chart and List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Box: Risk Density Distribution */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/40">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Interactive Risk Groups</span>
              </div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-white">
                Active Threats Node Density Curve
              </h2>
              <p className="text-[10px] text-white/40 uppercase">Click on any category bar to filter the high-risk registry below</p>
            </div>

            {/* Render Horizontal Segmented Bars */}
            <div className="space-y-4">
              {[
                { label: "LOW", score: "0% - 49%", count: riskGroups.LOW.length, color: "bg-emerald-400", border: "border-emerald-500/20" },
                { label: "MEDIUM", score: "50% - 69%", count: riskGroups.MEDIUM.length, color: "bg-cyan-400", border: "border-cyan-500/20" },
                { label: "HIGH", score: "70% - 84%", count: riskGroups.HIGH.length, color: "bg-amber-400", border: "border-amber-500/20" },
                { label: "CRITICAL", score: "85% - 100%", count: riskGroups.CRITICAL.length, color: "bg-rose-500", border: "border-rose-500/20" }
              ].map((bar, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedRiskBar(selectedRiskBar === bar.label ? null : bar.label)}
                  className={`p-4 border bg-[#080808]/80 hover:bg-white/[0.02] cursor-pointer rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    selectedRiskBar === bar.label ? "border-cyan-400 scale-[1.01] shadow-lg shadow-cyan-500/5" : "border-white/5"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase space-y-0.5">
                    <span className="font-bold text-white">{bar.label} LEVEL</span>
                    <div className="text-white/40">{bar.score} risk criteria</div>
                  </div>

                  <div className="flex-1 max-w-sm h-3 bg-white/5 overflow-hidden rounded-full sm:mx-8">
                    <div className={`h-full ${bar.color}`} style={{ width: `${Math.max(5, (bar.count / (alerts.length || 1)) * 100)}%` }}></div>
                  </div>

                  <div className="font-mono text-xs font-bold text-white text-right shrink-0">
                    {bar.count} Trigger Nodes ({Math.round((bar.count / (alerts.length || 1)) * 100)}%)
                  </div>
                </div>
              ))}
            </div>

            {selectedRiskBar && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 p-2.5 font-mono text-[9px] uppercase tracking-widest rounded-xl flex justify-between items-center">
                <span>Currently showing only <strong className="text-white">{selectedRiskBar} RISK</strong> nodes</span>
                <button onClick={() => setSelectedRiskBar(null)} className="underline font-bold hover:text-white uppercase cursor-pointer">[Clear Filter]</button>
              </div>
            )}
          </div>

          {/* Table: Filtered suspects */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white">Anomalous Risk Suspect Ledger</h3>
                <p className="text-[9px] text-white/40 uppercase mt-1">Audit high risk nodes matching criteria</p>
              </div>

              {/* Quick Search */}
              <div className="relative w-48 shrink-0">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-white/30" />
                <input 
                  type="text" 
                  value={suspectSearch}
                  onChange={e => setSuspectSearch(e.target.value)}
                  placeholder="Search holder/ID..."
                  className="w-full bg-[#080808] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-[9px] font-mono focus:outline-none focus:border-white/30 text-white placeholder-white/20 uppercase"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#080808]/80">
              <table className="w-full text-left font-mono text-[10px] uppercase">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 bg-[#0c0c0c]/90 text-[8px] tracking-widest font-bold">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Account Holder</th>
                    <th className="p-3">Risk score</th>
                    <th className="p-3">Primary Trigger</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSuspects.map((sus, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-white/30 font-bold">#{sus.id}</td>
                      <td className="p-3">
                        <div className="text-white font-bold">{sus.destHolder}</div>
                        <div className="text-[8px] text-white/40">{sus.destAccount}</div>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${sus.riskScore >= 85 ? "text-rose-400" : "text-amber-400"}`}>
                          {sus.riskScore}%
                        </span>
                      </td>
                      <td className="p-3 text-white/60">{sus.type.replace("_", " ")}</td>
                      <td className="p-3 text-right space-x-1.5">
                        {onSelectAlert && (
                          <button 
                            onClick={() => onSelectAlert(sus)}
                            className="px-2.5 py-1 border border-white/10 hover:bg-white/5 text-[9px] font-bold text-white tracking-wider rounded-xl cursor-pointer"
                          >
                            Audit
                          </button>
                        )}
                        {onAlertAction && (
                          <button 
                            onClick={() => onAlertAction(sus, "trace")}
                            className="px-2.5 py-1 bg-white text-black hover:bg-white/90 text-[9px] font-bold tracking-wider rounded-xl cursor-pointer"
                          >
                            Trace
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Upgraded Compliance Rules Simulator */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/40">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Upgrade Rules Controls</span>
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white">Compliance Heuristics Simulator</h3>
              <p className="text-[9px] text-white/40 uppercase mt-0.5 font-mono">Calibrate neural triggers & threshold metrics</p>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed font-sans">
              Tweak compliance-engine rules variables to forecast network-wide critical threat volumes.
            </p>

            <div className="space-y-4">
              {/* Dormancy days */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-white/70 font-mono text-[9px] uppercase">
                  <span>Dormancy Awake Gap</span>
                  <span className="text-cyan-400">{simDormancyDays} Days</span>
                </div>
                <input 
                  type="range" 
                  min="14" 
                  max="180" 
                  value={simDormancyDays} 
                  onChange={(e) => setSimDormancyDays(parseInt(e.target.value))}
                  className="w-full accent-white bg-white/10 cursor-pointer animate-none h-1 rounded-lg"
                />
              </div>

              {/* UPI exfil frequency */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-white/70 font-mono text-[9px] uppercase">
                  <span>Exfiltration Velocity Limit</span>
                  <span className="text-cyan-400">{simTxFrequencySecs} Seconds</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="300" 
                  value={simTxFrequencySecs} 
                  onChange={(e) => setSimTxFrequencySecs(parseInt(e.target.value))}
                  className="w-full accent-white bg-white/10 cursor-pointer animate-none h-1 rounded-lg"
                />
              </div>

              {/* Geography Travel Impossible swap */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-white/70 font-mono text-[9px] uppercase">
                  <span>Travel Velocity Radius</span>
                  <span className="text-cyan-400">{simGeographicDispersalKms} KM Gaps</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="1500" 
                  value={simGeographicDispersalKms} 
                  onChange={(e) => setSimGeographicDispersalKms(parseInt(e.target.value))}
                  className="w-full accent-white bg-white/10 cursor-pointer animate-none h-1 rounded-lg"
                />
              </div>

              {/* Transactions inside window */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-white/70 font-mono text-[9px] uppercase">
                  <span>Burst Tx count in Window</span>
                  <span className="text-cyan-400">{simTxCountInWindow} transfers</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  value={simTxCountInWindow} 
                  onChange={(e) => setSimTxCountInWindow(parseInt(e.target.value))}
                  className="w-full accent-white bg-white/10 cursor-pointer animate-none h-1 rounded-lg"
                />
              </div>
            </div>

            {/* Simulated result indicator */}
            <div className="border border-white/5 bg-[#080808]/80 p-4 rounded-xl font-mono text-[10px] uppercase space-y-3">
              <span className="text-[8px] text-white/30 font-bold block">FORECASTED FRAUD DENSITY</span>
              
              <div className="flex items-center justify-between">
                <span>SIMULATED RISK COEFFICIENT:</span>
                <span className={`font-bold ${simulatedIndex >= 75 ? "text-rose-400" : "text-cyan-400"}`}>
                  {simulatedIndex}%
                </span>
              </div>
              
              <div className="w-full bg-white/5 h-1.5 overflow-hidden rounded-full">
                <div className={`h-full ${simulatedIndex >= 75 ? "bg-rose-500" : "bg-cyan-400"}`} style={{ width: `${simulatedIndex}%` }}></div>
              </div>

              <div className="flex items-center gap-1.5 text-[8px] text-white/40 leading-relaxed font-sans mt-2 border-t border-white/5 pt-2">
                <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span>THIS CONDUCES TO AN APPROXIMATE FRAUD DETECT OF {Math.round(simulatedIndex * 0.28)} CRITICAL OUTFLOW POINTS.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

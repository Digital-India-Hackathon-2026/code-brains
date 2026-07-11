import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  ArrowLeft, 
  CheckCircle, 
  RefreshCw, 
  Building, 
  Wifi, 
  WifiOff,
  Database, 
  Send, 
  Play, 
  FileCode, 
  Check, 
  Info,
  Server,
  Terminal,
  Activity,
  Settings,
  Code
} from "lucide-react";

export default function SecureInterfacesPage({ onBack, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState("gateways"); // "gateways" | "springboot"

  const [bankSyncData, setBankSyncData] = useState([
    { id: "sbi", name: "State Bank of India", prefix: "SBI", latency: 14, status: "SECURE", nodeCount: 142 },
    { id: "pnb", name: "Punjab National Bank", prefix: "PNB", latency: 22, status: "SECURE", nodeCount: 89 },
    { id: "bob", name: "Bank of Baroda", prefix: "BOB", latency: 19, status: "SECURE", nodeCount: 74 },
    { id: "hdfc", name: "HDFC Bank Ltd", prefix: "HDFC", latency: 11, status: "SECURE", nodeCount: 115 },
    { id: "icici", name: "ICICI Bank Ltd", prefix: "ICICI", latency: 13, status: "SECURE", nodeCount: 98 },
    { id: "axis", name: "Axis Bank Ltd", prefix: "AXIS", latency: 17, status: "SECURE", nodeCount: 82 }
  ]);

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [consoleBank, setConsoleBank] = useState("SBI");
  const [consoleQueryType, setConsoleQueryType] = useState("ACCOUNT_DETAILS");
  const [consoleParam, setConsoleParam] = useState("99014582910");
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [isConsoleLoading, setIsConsoleLoading] = useState(false);

  // Spring Boot & ML Connection States
  const [springUrl, setSpringUrl] = useState(() => {
    return localStorage.getItem("muletrace-spring-url") || "http://localhost:8080";
  });
  const [mlEndpoint, setMlEndpoint] = useState(() => {
    return localStorage.getItem("muletrace-ml-endpoint") || "/api/v1/ml/predict";
  });
  const [useSpringBackend, setUseSpringBackend] = useState(() => {
    return localStorage.getItem("muletrace-use-spring") === "true";
  });

  const [springStatus, setSpringStatus] = useState("NOT_TESTED"); // "NOT_TESTED" | "CONNECTING" | "ONLINE" | "OFFLINE"
  const [springPingDetails, setSpringPingDetails] = useState(null);
  const [isPingLoading, setIsPingLoading] = useState(false);

  const [testMlOutput, setTestMlOutput] = useState(null);
  const [isMlTesting, setIsMlTesting] = useState(false);

  // Save Configs
  const handleSaveSpringConfig = () => {
    localStorage.setItem("muletrace-spring-url", springUrl);
    localStorage.setItem("muletrace-ml-endpoint", mlEndpoint);
    localStorage.setItem("muletrace-use-spring", useSpringBackend ? "true" : "false");
    if (showToast) showToast("Spring Boot backend & ML config saved.", "success");
  };

  useEffect(() => {
    localStorage.setItem("muletrace-use-spring", useSpringBackend ? "true" : "false");
  }, [useSpringBackend]);

  // Test real network connectivity to Spring Boot health endpoint
  const handleTestSpringConnection = async () => {
    setIsPingLoading(true);
    setSpringStatus("CONNECTING");
    setSpringPingDetails(null);

    try {
      const response = await fetch(`${springUrl}/api/v1/health`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        mode: "cors"
      });

      if (response.ok) {
        const data = await response.json();
        setSpringStatus("ONLINE");
        setSpringPingDetails(data);
        if (showToast) showToast("Connection established! Spring Boot is ONLINE.", "success");
      } else {
        throw new Error(`HTTP status code ${response.status}`);
      }
    } catch (err) {
      console.warn("Spring Boot Offline check:", err);
      setSpringStatus("OFFLINE");
      setSpringPingDetails({
        error: "Connection refused or CORS disabled",
        reasons: [
          "No Spring Boot application is currently running at " + springUrl,
          "The Spring Boot endpoint does not have @CrossOrigin configured",
          "Local firewalls or network boundaries blocked the direct network fetch"
        ]
      });
      if (showToast) showToast("Spring Boot connection failed. Running in offline fallback.", "error");
    } finally {
      setIsPingLoading(false);
    }
  };

  // Test real network model prediction call to Spring Boot ML inference endpoint
  const handleTestMlPrediction = async () => {
    setIsMlTesting(true);
    setTestMlOutput(null);

    const testPayload = [
      {
        id: "TX-TEST-001",
        sourceAccount: "910294112233",
        sourceHolder: "Preeti Patil",
        sourceBank: "HDFC Bank",
        destAccount: "109283746501",
        destHolder: "Karan Johar",
        destBank: "Axis Bank",
        amount: 49500,
        timestamp: new Date().toISOString(),
        method: "UPI"
      }
    ];

    try {
      const response = await fetch(`${springUrl}${mlEndpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        const data = await response.json();
        setTestMlOutput(data);
        if (showToast) showToast("ML inference completed successfully on Spring Boot!", "success");
      } else {
        throw new Error(`Inference returned HTTP status ${response.status}`);
      }
    } catch (err) {
      console.warn("ML Endpoint Offline:", err);
      setTestMlOutput({
        error: "Inference service unreachable",
        fallbackReason: "Spring Boot server returned error or is offline.",
        fallbackOutput: {
          compositeRiskScore: 82.5,
          riskLevel: "HIGH",
          flaggedReasons: ["High velocity layering (Heuristics Fallback)"],
          timestamp: new Date().toISOString()
        }
      });
      if (showToast) showToast("Inference endpoint unreachable. Outputting fallback metrics.", "info");
    } finally {
      setIsMlTesting(false);
    }
  };

  const totalNodes = bankSyncData.reduce((acc, curr) => acc + curr.nodeCount, 0);
  const avgLatency = Math.round(bankSyncData.reduce((acc, curr) => acc + curr.latency, 0) / bankSyncData.length);

  // Re-sync all gateways
  const handleSyncAll = () => {
    setIsSyncingAll(true);
    if (showToast) showToast("Initiated global inter-bank resynchronization...", "info");

    setTimeout(() => {
      setBankSyncData(prev => prev.map(bank => ({
        ...bank,
        latency: Math.floor(7 + Math.random() * 15),
        nodeCount: bank.nodeCount + Math.floor(Math.random() * 5) - 1
      })));
      setIsSyncingAll(false);
      if (showToast) showToast("Global resynchronization complete. NPCI ledger secure.", "success");
    }, 1800);
  };

  // Test single bank gateway
  const handleTestBank = (id) => {
    setBankSyncData(prev => prev.map(b => b.id === id ? { ...b, isTesting: true } : b));
    
    setTimeout(() => {
      setBankSyncData(prev => prev.map(b => {
        if (b.id === id) {
          const newLatency = Math.floor(8 + Math.random() * 14);
          if (showToast) {
            showToast(`${b.name} Gateway verified. Latency: ${newLatency}ms. Protocol OK.`, "success");
          }
          return { ...b, isTesting: false, latency: newLatency, nodeCount: b.nodeCount + 1 };
        }
        return b;
      }));
    }, 1200);
  };

  // Run Custom Console Query Simulator
  const handleRunConsoleQuery = () => {
    setIsConsoleLoading(true);
    setConsoleOutput(null);

    setTimeout(() => {
      setIsConsoleLoading(false);
      setConsoleOutput({
        status: "SUCCESS_OK",
        code: 200,
        gateway: consoleBank + "-SECURE-API-v3",
        timestamp: new Date().toISOString(),
        requestType: consoleQueryType,
        parameters: {
          lookupField: "ACCOUNT_IDENTIFIER",
          lookupValue: consoleParam
        },
        payload: {
          nodeValid: true,
          regulatoryLienStatus: "FREEZE_RECOMENDED",
          complianceSection: "SECTION-62_REGULATIONS",
          holderName: consoleParam.includes("582910") ? "Prakash Mehta" : consoleParam.includes("123456") ? "Siddharth Malhotra" : "Anish Kapoor",
          accountRiskIndex: consoleQueryType === "ACCOUNT_DETAILS" ? "79.8%" : "91.2%",
          associatedUPIs: [
            "prakashmehta@okaxis",
            "mehta.invest@oksbi"
          ],
          flaggedDeviceMac: "FC:E9:98:21:44:A2",
          monitoredLocation: "Mumbai, MH (Inbound Server)"
        }
      });
      if (showToast) showToast("Console diagnostic payload returned.", "info");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Back Header Banner */}
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
                GATEWAY SECURE
              </span>
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">
                INTER-BANK API NODE CONTROL
              </span>
            </div>
            <h1 className="text-lg font-bold text-white uppercase tracking-widest font-sans mt-0.5">
              Secure Gateway Diagnostics
            </h1>
          </div>
        </div>
        <div className="flex bg-white/[0.02] border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("gateways")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
              activeSubTab === "gateways"
                ? "bg-white text-black"
                : "text-white/45 hover:text-white"
            }`}
          >
            Partner Gateways
          </button>
          <button
            onClick={() => setActiveSubTab("springboot")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === "springboot"
                ? "bg-white text-black"
                : "text-white/45 hover:text-white"
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>ML & Spring Boot Linkage</span>
          </button>
        </div>
      </div>

      {activeSubTab === "springboot" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Left Column: Spring Boot URL & Connectivity Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/40">
              <div>
                <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400">Spring Boot & Machine Learning Integration</h2>
                <p className="text-[10px] text-white/50 font-mono uppercase mt-1 leading-relaxed">
                  Configure direct linkage with your custom Spring Boot REST APIs and machine learning model endpoints.
                </p>
              </div>

              {/* Form Input Config Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono uppercase tracking-wider text-white/80">
                <div className="space-y-1.5 bg-[#080808]/40 p-4 rounded-xl border border-white/5">
                  <label className="text-[8px] text-white/40 font-bold block">Spring Boot Base URL</label>
                  <input
                    type="text"
                    value={springUrl}
                    onChange={(e) => setSpringUrl(e.target.value)}
                    placeholder="e.g. http://localhost:8080"
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-[11px] transition-all"
                  />
                  <p className="text-[7.5px] text-white/30 lowercase font-mono">Accepts running microservices in development or cloud.</p>
                </div>

                <div className="space-y-1.5 bg-[#080808]/40 p-4 rounded-xl border border-white/5">
                  <label className="text-[8px] text-white/40 font-bold block">ML Inference Endpoint</label>
                  <input
                    type="text"
                    value={mlEndpoint}
                    onChange={(e) => setMlEndpoint(e.target.value)}
                    placeholder="e.g. /api/v1/ml/predict"
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-[11px] transition-all"
                  />
                  <p className="text-[7.5px] text-white/30 lowercase font-mono">The POST endpoint where transaction lists are analyzed.</p>
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#080808]/40 border border-white/5 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useSpringBackend}
                    onChange={(e) => setUseSpringBackend(e.target.checked)}
                    className="rounded border border-white/20 bg-[#080808] text-cyan-500 focus:ring-cyan-500/20 w-4.5 h-4.5"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider block">ROUTE HEURISTICS TO SPRING BACKEND</span>
                    <span className="text-[8px] text-white/40 block mt-0.5">If checked, transaction scratchpad executes calculations directly on your REST backend.</span>
                  </div>
                </label>
                <button
                  onClick={handleSaveSpringConfig}
                  className="px-4 py-2 bg-white hover:bg-white/90 text-black font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-md self-end sm:self-auto"
                >
                  Save Configuration
                </button>
              </div>

              {/* Connection Diagnostics Terminal */}
              <div className="border border-white/5 bg-[#080808]/90 p-4 rounded-xl flex flex-col md:flex-row items-stretch justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">GATEWAY LINK PING TEST</span>
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                      springStatus === "ONLINE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : springStatus === "OFFLINE"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : springStatus === "CONNECTING"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : "bg-white/5 text-white/40 border-white/10"
                    }`}>
                      {springStatus === "ONLINE" ? "● CONNECTED" : springStatus === "OFFLINE" ? "▲ UNREACHABLE" : springStatus === "CONNECTING" ? "CONNECTING..." : "NOT RUNNING"}
                    </span>
                  </div>

                  <p className="text-[9.5px] font-mono text-white/50 leading-relaxed uppercase">
                    Verify connectivity with Spring Boot by sending a standard HTTP GET handshake payload.
                  </p>

                  <button
                    onClick={handleTestSpringConnection}
                    disabled={isPingLoading}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-md"
                  >
                    {isPingLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Handshaking...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Test Spring Handshake (GET)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                  <div className="font-mono text-[8.5px] text-white/30 uppercase tracking-wider mb-2 flex justify-between">
                    <span>HANDSHAKE_RESPONSE_STREAM</span>
                    <span className="text-white/20">JSON</span>
                  </div>
                  
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-[8px] text-white/50 overflow-y-auto max-h-[140px] uppercase leading-normal flex-1">
                    {springPingDetails ? (
                      <pre className="text-emerald-400 whitespace-pre-wrap">
                        {JSON.stringify(springPingDetails, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-white/20 h-full flex items-center justify-center text-center py-4">
                        Awaiting link diagnostic test.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inference Diagnostics Terminal */}
              <div className="border border-white/5 bg-[#080808]/90 p-4 rounded-xl flex flex-col md:flex-row items-stretch justify-between gap-6 mt-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">ML MODEL PREDICTION POST TEST</span>
                  </div>

                  <p className="text-[9.5px] font-mono text-white/50 leading-relaxed uppercase">
                    Submit a simulated UPI trace sequence payload to your Spring Boot REST model and check custom neural classification outcomes.
                  </p>

                  <button
                    onClick={handleTestMlPrediction}
                    disabled={isMlTesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-md"
                  >
                    {isMlTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating ML Inference...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Test Model Prediction (POST)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                  <div className="font-mono text-[8.5px] text-white/30 uppercase tracking-wider mb-2 flex justify-between">
                    <span>ML_INFERENCE_RESPONSE</span>
                    <span className="text-white/20">JSON</span>
                  </div>
                  
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-[8px] text-white/50 overflow-y-auto max-h-[140px] uppercase leading-normal flex-1">
                    {testMlOutput ? (
                      <pre className={`${testMlOutput.error ? 'text-amber-400' : 'text-emerald-400'} whitespace-pre-wrap`}>
                        {JSON.stringify(testMlOutput, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-white/20 h-full flex items-center justify-center text-center py-4">
                        Awaiting ML transaction test trigger.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Code Export Blueprint and guidelines */}
          <div className="space-y-6">
            <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 space-y-5 flex flex-col justify-between min-h-[460px] shadow-xl shadow-black/40">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white font-mono">Spring Boot Blueprint</h3>
                </div>

                <p className="text-[9.5px] text-white/40 font-mono uppercase leading-relaxed">
                  Implement the corresponding REST controller inside your Spring Boot application to handle incoming trace checks:
                </p>

                {/* Java Code block */}
                <div className="bg-black/80 rounded-xl p-3 border border-white/5 font-mono text-[7px] text-cyan-300 leading-normal overflow-x-auto relative">
                  <span className="absolute top-1 right-2 text-[6px] text-white/20">Java Controller</span>
                  <pre className="whitespace-pre">
{`@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*") 
public class MuleTraceController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> map = new HashMap<>();
        map.put("status", "UP");
        map.put("model", "RandomForest-v3.1");
        map.put("active_nodes", 148);
        map.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(map);
    }

    @PostMapping("/ml/predict")
    public ResponseEntity<Map<String, Object>> predict(
            @RequestBody List<Map<String, Object>> txs) {
        
        // Custom ML Model Inference Logic
        double riskScore = calculateMuleScore(txs);
        
        Map<String, Object> res = new HashMap<>();
        res.put("compositeRiskScore", riskScore);
        res.put("riskLevel", riskScore >= 75 ? "CRITICAL" : 
                             riskScore >= 40 ? "HIGH" : "LOW");
        res.put("flaggedReasons", Arrays.asList(
            "Layer 2 splitting pattern matching neural hubs",
            "UPI latency speed &gt; local baseline"
        ));
        res.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(res);
    }
}`}
                  </pre>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[8.5px] font-mono uppercase tracking-wider text-white/30 leading-relaxed">
                By implementing this backend endpoint, your actual AI models can analyze transfer pathways real-time through the frontend visualizer and sandbox panels.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Summary Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Sync Gateway Status</span>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-3xl font-light font-mono text-white">6 / 6 LIVE</span>
              </div>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Average API Latency</span>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-light font-mono text-cyan-400">{avgLatency} ms</span>
                <span className="text-[9px] text-white/30 font-mono">STABLE LIMIT</span>
              </div>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Monitored Account Nodes</span>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-light font-mono text-white">{totalNodes}</span>
                <span className="text-[9px] text-white/30 font-mono">AML INBOUNDS</span>
              </div>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-black/40">
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Global ledger Sync Rate</span>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-light font-mono text-emerald-400">100%</span>
                <span className="text-[9px] text-emerald-400/40 font-mono uppercase font-bold">NPCI REGISTERED</span>
              </div>
            </div>
          </div>

          {/* Main split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Bank Gateways grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/40">
                <div>
                  <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-white">Active Partner Bank Interfaces</h2>
                  <p className="text-[9px] text-white/40 uppercase font-mono mt-0.5">Disciplinary action endpoints with sub-62 direct integration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bankSyncData.map((gate) => (
                    <div 
                      key={gate.id} 
                      className="bg-[#080808]/80 border border-white/5 hover:border-white/10 p-4 rounded-xl flex flex-col justify-between gap-4 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-white/55" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase">{gate.name}</span>
                          </div>
                          <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">[{gate.prefix}]</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase border-y border-white/5 py-2.5 my-1 text-white/50">
                          <div>
                            <span className="text-white/20 text-[7px] block">LATENCY</span>
                            <span className={`font-bold ${gate.latency > 18 ? "text-amber-400" : "text-emerald-400"}`}>
                              {gate.latency}ms
                            </span>
                          </div>
                          <div>
                            <span className="text-white/20 text-[7px] block">MONITORED</span>
                            <span className="text-white font-bold">{gate.nodeCount} accounts</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                          <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest">ONLINE</span>
                        </div>

                        <button
                          onClick={() => handleTestBank(gate.id)}
                          disabled={gate.isTesting}
                          className="px-2.5 py-1 bg-white hover:bg-white/90 disabled:opacity-30 text-black text-[9px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          {gate.isTesting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Testing...</span>
                            </>
                          ) : (
                            <span>Test API</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: API Sandbox Query Console */}
            <div className="space-y-6">
              <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between min-h-[460px] shadow-xl shadow-black/40">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white font-mono">Gateway API Console</h3>
                  </div>

                  <p className="text-[9px] text-white/40 font-mono uppercase leading-relaxed">
                    Interrogate banking ledgers manually inside our regulatory sandboxed API gateway environment.
                  </p>

                  {/* Console Params */}
                  <div className="space-y-3 font-mono text-[9px] uppercase text-white/70">
                    <div className="space-y-1">
                      <label className="text-white/30 block text-[8px] font-bold">Select Target Gateway</label>
                      <select 
                        value={consoleBank}
                        onChange={e => setConsoleBank(e.target.value)}
                        className="w-full bg-[#080808] border border-white/10 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none focus:border-white/30 uppercase cursor-pointer text-[10px]"
                      >
                        <option value="SBI">SBI Gateway</option>
                        <option value="PNB">PNB Gateway</option>
                        <option value="BOB">BOB Gateway</option>
                        <option value="HDFC">HDFC Gateway</option>
                        <option value="AXIS">AXIS Gateway</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/30 block text-[8px] font-bold">Request Resource Type</label>
                      <select 
                        value={consoleQueryType}
                        onChange={e => setConsoleQueryType(e.target.value)}
                        className="w-full bg-[#080808] border border-white/10 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none focus:border-white/30 uppercase cursor-pointer text-[10px]"
                      >
                        <option value="ACCOUNT_DETAILS">ACCOUNT_DETAILS_QUERY</option>
                        <option value="LIEN_STATUS">LIEN_STATUS_INQUIRY</option>
                        <option value="DEVICE_MATCH">DEVICE_MAC_IDENTIFIER</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/30 block text-[8px] font-bold">Query Parameter (Val)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={consoleParam}
                          onChange={e => setConsoleParam(e.target.value)}
                          className="flex-1 bg-[#080808] border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-white/30 uppercase"
                        />
                        <button 
                          onClick={() => setConsoleParam("9901" + Math.floor(10000 + Math.random() * 90000))}
                          className="px-2.5 border border-white/10 hover:bg-white/5 text-[8px] font-mono text-white/50 hover:text-white rounded-xl transition-all cursor-pointer"
                        >
                          RAND
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRunConsoleQuery}
                    disabled={isConsoleLoading}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isConsoleLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Transmitting Payload...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Secure Query</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Console Output Terminal */}
                <div className="border border-white/5 bg-[#080808]/80 p-3 rounded-xl font-mono text-[8px] text-white/40 min-h-[140px] max-h-[220px] overflow-y-auto uppercase relative mt-4">
                  <span className="absolute top-1.5 right-2 text-white/15">TERMINAL OUT</span>
                  {isConsoleLoading && <div className="text-cyan-400 animate-pulse">Awaiting handshake response packet...</div>}
                  {!isConsoleLoading && !consoleOutput && (
                    <div className="text-white/20 h-full flex items-center justify-center text-center py-8">
                      Console idle. Submit a structured gateway request.
                    </div>
                  )}
                  {consoleOutput && (
                    <pre className="text-emerald-400/90 whitespace-pre-wrap leading-normal select-text">
                      {JSON.stringify(consoleOutput, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

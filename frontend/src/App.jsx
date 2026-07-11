import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import MuleTraceView from "./components/MuleTraceView";
import SandboxView from "./components/SandboxView";
import SarReportView from "./components/SarReportView";
import HelpChatbot from "./components/HelpChatbot";
import SignInPage from "./components/SignInPage";
import { initialAlerts } from "./data";
import { AccountType, RiskLevel } from "./types";
import { 
  Shield, 
  LayoutDashboard, 
  Eye, 
  Play, 
  FileText, 
  Menu, 
  X, 
  Landmark, 
  Activity, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ArrowRight,
  Info,
  LogOut
} from "lucide-react";

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("muletrace-theme") || "dark";
    }
    return "dark";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("muletrace-authenticated") === "true";
    }
    return false;
  });

  const [userPrincipal, setUserPrincipal] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("muletrace-user") || "investigator";
    }
    return "investigator";
  });

  const [userClearance, setUserClearance] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("muletrace-clearance") || "LEVEL 2: COMPLIANCE OFFICER";
    }
    return "LEVEL 2: COMPLIANCE OFFICER";
  });

  const handleSignInSuccess = (username, clearance) => {
    setIsAuthenticated(true);
    setUserPrincipal(username);
    setUserClearance(clearance);
    localStorage.setItem("muletrace-authenticated", "true");
    localStorage.setItem("muletrace-user", username);
    localStorage.setItem("muletrace-clearance", clearance);
    showToast(`Session established: ${username.toUpperCase()} logged in`, "success");
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("muletrace-authenticated");
    localStorage.removeItem("muletrace-user");
    localStorage.removeItem("muletrace-clearance");
    showToast("Session terminated. Security handshake cleared.", "info");
  };

  useEffect(() => {
    localStorage.setItem("muletrace-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // State linking helpers
  const [selectedScenarioId, setSelectedScenarioId] = useState("sc-gold-smurf");
  const [prepopulatedAccountForSar, setPrepopulatedAccountForSar] = useState(null);
  
  // Mobile drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Unread alerts counter
  const unreadCount = alerts.filter(a => a.status === "NEW").length;

  // Custom Interactive Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Maps a SystemAlert into a full BankAccount for SAR pre-population
  const mapAlertToBankAccount = (alert) => {
    let mappedType = AccountType.MULE_L1;
    if (alert.type === "RAPID_CHAIN") {
      mappedType = AccountType.MULE_L2;
    } else if (alert.type === "SMURF_FUNNEL") {
      mappedType = AccountType.MULE_L3;
    } else if (alert.type === "DORMANT_AWAKENING") {
      mappedType = AccountType.EXIT;
    }

    return {
      accountNumber: alert.destAccount,
      holderName: alert.destHolder,
      bankName: alert.id === "AL-8921" ? "HDFC Bank" : alert.id === "AL-8922" ? "Axis Bank" : "State Bank of India",
      riskScore: alert.riskScore,
      riskLevel: alert.riskLevel,
      type: mappedType,
      isActive: true,
      dormantPeriodDays: alert.type === "DORMANT_AWAKENING" ? 140 : 12,
      phoneLinked: "+91 9901" + Math.floor(10000 + Math.random() * 90000),
      deviceFingerprint: "DEV-FINGERPRINT-" + alert.id,
      location: alert.id === "AL-8922" ? "Jaipur, Rajasthan" : "Mumbai, Maharashtra",
      createdAt: "2024-03-01",
      balance: alert.amount
    };
  };

  // Handle actions clicked inside Dashboard feeds
  const handleAlertAction = (targetAlert, action) => {
    if (action === "trace") {
      // Map alert type to pre-defined scenario presets
      if (targetAlert.type === "DORMANT_AWAKENING" || targetAlert.type === "VELOCITY_SPIKE") {
        setSelectedScenarioId("sc-sleeper-awaken");
      } else if (targetAlert.type === "SMURF_FUNNEL") {
        setSelectedScenarioId("sc-structuring-smurf");
      } else {
        setSelectedScenarioId("sc-gold-smurf");
      }
      setActiveTab("trace");
      showToast(`Visualizer loaded: ${targetAlert.type.replace("_", " ")} scenario`, "info");
    } else if (action === "block") {
      // Simulate blocking the transaction
      setAlerts(prev => prev.map(a => {
        if (a.id === targetAlert.id) {
          return { ...a, status: "BLOCKED" };
        }
        return a;
      }));
      showToast(`SUCCESS: Regulatory Asset Hold dispatched on node. Receiving entity notified.`, "success");
    }
  };

  // Handle clicking an alert in dashboard log
  const handleSelectAlert = (alert) => {
    setSelectedAlert(alert);
    // Auto mark as investigating
    setAlerts(prev => prev.map(a => {
      if (a.id === alert.id && a.status === "NEW") {
        return { ...a, status: "INVESTIGATING" };
      }
      return a;
    }));
  };

  // Deep-link from tracing node to SAR report
  const handleGoToSar = (account) => {
    setPrepopulatedAccountForSar(account);
    setActiveTab("sar");
    showToast(`Drafting SAR Report for node ${account.holderName}`, "info");
  };

  // Interactive functions executed from within the Detail Inspector Overlay Modal
  const executeModalFreeze = (alertId) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: "BLOCKED" };
      }
      return a;
    }));
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: "BLOCKED" });
    }
    showToast(`Hold confirmation logged. AML node marked as FROZEN in national directory.`, "success");
  };

  const executeModalWhitelist = (alertId) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: "RESOLVED" };
      }
      return a;
    }));
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: "RESOLVED" });
    }
    showToast(`Alert whitelisted. Marked as false positive under investigator override.`, "info");
  };

  const executeModalDeepLinkTrace = (targetAlert) => {
    setSelectedAlert(null); // Close modal
    handleAlertAction(targetAlert, "trace");
  };

  const executeModalDeepLinkSar = (targetAlert) => {
    setSelectedAlert(null); // Close modal
    const tempAcc = mapAlertToBankAccount(targetAlert);
    handleGoToSar(tempAcc);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            alerts={alerts}
            onAlertAction={handleAlertAction}
            onSelectAlert={handleSelectAlert}
            onGoToTab={setActiveTab}
          />
        );
      case "trace":
        return (
          <MuleTraceView
            initialScenarioId={selectedScenarioId}
            onGoToSar={handleGoToSar}
          />
        );
      case "sandbox":
        return <SandboxView />;
      case "sar":
        return (
          <SarReportView
            prepopulatedAccount={prepopulatedAccountForSar}
          />
        );
      default:
        return (
          <DashboardView 
            alerts={alerts} 
            onAlertAction={handleAlertAction} 
            onSelectAlert={handleSelectAlert} 
          />
        );
    }
  };

  // Custom Rupees formatting helper
  const formatRupees = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#e0e0e0] flex font-sans antialiased">
        <SignInPage onSignInSuccess={handleSignInSuccess} />
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
            <div className={`rounded-2xl border p-4 shadow-2xl flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider max-w-sm backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-[#0c0c0c]/90 border-emerald-500/40 text-emerald-400" 
                : toast.type === "error"
                  ? "bg-[#0c0c0c]/90 border-rose-500/40 text-rose-400"
                  : "bg-[#0c0c0c]/90 border-cyan-500/40 text-cyan-400"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === "error" ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <div className="flex-1 leading-relaxed">
                <strong>{toast.type === "success" ? "TRANSACTION SECURED" : toast.type === "error" ? "HOLD ACTION WARNING" : "GATEWAY INFORMATION"}</strong>
                <div className="text-[9px] text-white/60 mt-0.5">{toast.message}</div>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="text-white/40 hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                [X]
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#e0e0e0] flex font-sans antialiased transition-colors duration-200">
      
      {/* 1. Left Sidebar Navigation Panel - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0c0c0c] border-r border-white/10 shrink-0">
        {/* Branding header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-6 h-6 bg-white rotate-45 flex items-center justify-center shrink-0">
            <div className="w-3 h-3 bg-[#0c0c0c] rotate-45"></div>
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase font-sans text-white">
              MULETRACE.AI
            </h2>
            <p className="text-[9px] text-white/30 font-mono tracking-widest">CYBER FORENSICS // v3.1</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full py-2.5 px-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-white text-black border-white shadow-lg shadow-white/5"
                : "text-white/50 bg-transparent hover:bg-white/5 border-transparent hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("trace")}
            className={`w-full py-2.5 px-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border cursor-pointer ${
              activeTab === "trace"
                ? "bg-white text-black border-white shadow-lg shadow-white/5"
                : "text-white/50 bg-transparent hover:bg-white/5 border-transparent hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Visualizer</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`w-full py-2.5 px-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-white text-black border-white shadow-lg shadow-white/5"
                : "text-white/50 bg-transparent hover:bg-white/5 border-transparent hover:text-white"
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab("sar")}
            className={`w-full py-2.5 px-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border cursor-pointer ${
              activeTab === "sar"
                ? "bg-white text-black border-white shadow-lg shadow-white/5"
                : "text-white/50 bg-transparent hover:bg-white/5 border-transparent hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SAR Report</span>
          </button>

          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border border-transparent text-rose-400 hover:bg-rose-500/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer branding */}
        <div className="p-4 border-t border-white/10 bg-[#080808] text-center text-[9px] font-mono text-white/30 tracking-widest uppercase">
          <div>PSB HACKATHON 2026</div>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span>NODE SECURE</span>
          </div>
        </div>
      </aside>

      {/* 2. Left Sidebar Drawer - Mobile Toggle Menu */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-64 bg-[#0c0c0c] border-r border-white/10 h-full p-5 space-y-6 flex flex-col justify-between" onClick={e => e.stopPropagation()}>
            <div className="space-y-6">
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rotate-45 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#0c0c0c] rotate-45"></div>
                  </div>
                  <span className="font-bold text-xs font-mono tracking-wider text-white uppercase">MuleTrace.AI</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white/60 hover:text-white p-1 bg-[#080808] rounded-none border border-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Nav links */}
              <nav className="space-y-2">
                <button
                  onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
                  className={`w-full py-2 px-3 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border ${
                    activeTab === "dashboard" ? "bg-white text-black border-white" : "text-white/50 border-transparent text-white/50 bg-transparent hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => { setActiveTab("trace"); setIsSidebarOpen(false); }}
                  className={`w-full py-2 px-3 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border ${
                    activeTab === "trace" ? "bg-white text-black border-white" : "text-white/50 border-transparent text-white/50 bg-transparent hover:bg-white/5"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Visualizer</span>
                </button>

                <button
                  onClick={() => { setActiveTab("sandbox"); setIsSidebarOpen(false); }}
                  className={`w-full py-2 px-3 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border ${
                    activeTab === "sandbox" ? "bg-white text-black border-white" : "text-white/50 border-transparent text-white/50 bg-transparent hover:bg-white/5"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Sandbox</span>
                </button>

                <button
                  onClick={() => { setActiveTab("sar"); setIsSidebarOpen(false); }}
                  className={`w-full py-2 px-3 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border ${
                    activeTab === "sar" ? "bg-white text-black border-white" : "text-white/50 border-transparent text-white/50 bg-transparent hover:bg-white/5"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>SAR Report</span>
                </button>

                <div className="pt-2 border-t border-white/10 mt-2">
                  <button
                    onClick={() => { handleSignOut(); setIsSidebarOpen(false); }}
                    className="w-full py-2 px-3 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 transition-all border border-transparent text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>

            <div className="text-[9px] font-mono text-white/30 text-center tracking-widest uppercase">
              PSB HACKATHON 2026
            </div>
          </div>
        </div>
      )}

      {/* 3. Right Content Container (Header + active viewport) */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        
        {/* Mobile quick header bar */}
        <div className="lg:hidden bg-[#0c0c0c] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 text-white/60 hover:text-white bg-[#080808] border border-white/10 rounded-none">
              <Menu className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs font-mono tracking-widest text-white uppercase">MULETRACE.AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-white/60 hover:text-white bg-[#080808] border border-white/10 rounded-none transition-all flex items-center justify-center"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
            <div className="text-[9px] bg-white/5 text-white/75 px-2 py-0.5 rounded-none font-mono border border-white/10 uppercase tracking-widest">
              MOBILE ACTIVE
            </div>
          </div>
        </div>

        {/* Shared Desktop Upper diagnostic banner */}
        <Header
          activeTab={activeTab}
          unreadAlertsCount={unreadCount}
          theme={theme}
          onToggleTheme={toggleTheme}
          userPrincipal={userPrincipal}
          userClearance={userClearance}
          onSearch={(q) => {
            if (q.length > 5) {
              setActiveTab("trace");
            }
          }}
        />

        {/* Viewport content area */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* ======================================================= */}
      {/* INTERACTIVE TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`rounded-2xl border p-4 shadow-2xl flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider max-w-sm backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-[#0c0c0c]/90 border-emerald-500/40 text-emerald-400" 
              : toast.type === "error"
                ? "bg-[#0c0c0c]/90 border-rose-500/40 text-rose-400"
                : "bg-[#0c0c0c]/90 border-cyan-500/40 text-cyan-400"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <div className="flex-1 leading-relaxed">
              <strong>{toast.type === "success" ? "TRANSACTION SECURED" : toast.type === "error" ? "HOLD ACTION WARNING" : "GATEWAY INFORMATION"}</strong>
              <div className="text-[9px] text-white/60 mt-0.5">{toast.message}</div>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-white/40 hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* INTERACTIVE SUSPECT DETAILED INSPECTOR OVERLAY MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header with status badge */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#080808]">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4.5 h-4.5 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Forensic Threat Node Audit</h3>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Alert ID: {selectedAlert.id} // Risk: {selectedAlert.riskScore}%</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[450px]">
              
              {/* Profile Block */}
              <div className="bg-[#080808]/80 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-white/40 block uppercase tracking-widest">Target Suspect Node</span>
                  <div className="text-sm font-bold text-white uppercase mt-0.5">{selectedAlert.destHolder}</div>
                  <div className="text-[10px] font-mono text-white/40 mt-1 uppercase">Account: {selectedAlert.destAccount}</div>
                </div>
                <div className={`text-[10px] font-mono font-bold border px-2.5 py-1 uppercase tracking-wider rounded-lg ${
                  selectedAlert.status === "BLOCKED" 
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                    : selectedAlert.status === "RESOLVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {selectedAlert.status}
                </div>
              </div>

              {/* Transaction details & path */}
              <div className="space-y-2.5 uppercase font-mono text-[10px]">
                <span className="text-white/40 font-bold tracking-widest text-[9px]">Siphonage Path Analysis</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#080808]/80 border border-white/5 p-3 rounded-xl">
                    <span className="text-white/30 text-[8px] font-bold">Inbound Source</span>
                    <div className="text-white/80 font-bold truncate mt-1">{selectedAlert.sourceHolder}</div>
                    <div className="text-white/40 text-[9px] mt-0.5 truncate">{selectedAlert.sourceAccount}</div>
                  </div>
                  <div className="bg-[#080808]/80 border border-white/5 p-3 rounded-xl">
                    <span className="text-white/30 text-[8px] font-bold">Credit Amount</span>
                    <div className="text-rose-400 font-bold font-sans text-xs mt-1">{formatRupees(selectedAlert.amount)}</div>
                    <div className="text-white/40 text-[9px] mt-0.5">UPI Platform Transfer</div>
                  </div>
                </div>
              </div>

              {/* Risk heuristics parameters */}
              <div className="space-y-2 font-mono text-[10px] uppercase">
                <span className="text-white/40 font-bold tracking-widest text-[9px]">Rule Engine Scoring Breakdown</span>
                <div className="border border-white/5 p-4 rounded-xl bg-[#080808]/80 space-y-3">
                  <div className="flex justify-between font-bold">
                    <span>Heuristics Category</span>
                    <span className="text-cyan-400">{selectedAlert.type.replace("_", " ")}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-white/50">
                      <span>Neural Risk Probability Score</span>
                      <span className="text-rose-400 font-bold">{selectedAlert.riskScore}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 overflow-hidden rounded-full">
                      <div className="bg-rose-500 h-full" style={{ width: `${selectedAlert.riskScore}%` }}></div>
                    </div>
                  </div>
                  <p className="text-[9px] text-white/40 leading-relaxed font-sans">
                    Account woke up after prolonged dormancy of &gt;90 days and received extreme velocity credits exceeding cumulative limits, flagged by our Public Sector Bank AML compliance layer.
                  </p>
                </div>
              </div>

              {/* Device and Network Metadata */}
              <div className="space-y-2 uppercase font-mono text-[10px]">
                <span className="text-white/40 font-bold tracking-widest text-[9px]">ISP & Device Footprint</span>
                <div className="grid grid-cols-2 gap-3 bg-[#080808]/80 p-3 border border-white/5 rounded-xl">
                  <div>
                    <span className="text-white/30 text-[8px]">Linked Device IP</span>
                    <div className="text-white/80 font-bold mt-1">192.168.10.42</div>
                  </div>
                  <div>
                    <span className="text-white/30 text-[8px]">Device Fingerprint</span>
                    <div className="text-white/80 font-bold mt-1 truncate">DEV-OPPO-F9-X7</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#080808] flex flex-col gap-2.5">
              
              {/* Primary action row */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => executeModalFreeze(selectedAlert.id)}
                  disabled={selectedAlert.status === "BLOCKED"}
                  className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedAlert.status === "BLOCKED" ? "Assets Frozen" : "Freeze Assets"}</span>
                </button>
                
                <button
                  onClick={() => executeModalWhitelist(selectedAlert.id)}
                  disabled={selectedAlert.status === "RESOLVED"}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedAlert.status === "RESOLVED" ? "Whitelisted" : "Whitelist Node"}</span>
                </button>
              </div>

              {/* Secondary deep-linking navigation */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => executeModalDeepLinkTrace(selectedAlert)}
                  className="py-2.5 px-4 bg-transparent hover:bg-white/5 border border-white/10 text-white/80 hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <span>Visualize Trail</span>
                </button>
                
                <button
                  onClick={() => executeModalDeepLinkSar(selectedAlert)}
                  className="py-2.5 px-4 bg-transparent hover:bg-white/5 border border-white/10 text-white/80 hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <span>Draft SAR report</span>
                </button>
              </div>

              {/* Cancel close */}
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                Dismiss Audit Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Hovering Help & Compliance Chatbot */}
      <HelpChatbot 
        alerts={alerts}
        setAlerts={setAlerts}
        onGoToTab={setActiveTab}
        showToast={showToast}
      />

    </div>
  );
}

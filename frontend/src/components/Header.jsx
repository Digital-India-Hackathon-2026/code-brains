import React, { useState, useEffect } from "react";
import { Shield, Search, Activity, Cpu, Clock, CheckCircle, Sun, Moon, X, User, Mail, ShieldAlert } from "lucide-react";

export default function Header({ 
  activeTab, 
  onSearch, 
  unreadAlertsCount, 
  theme, 
  onToggleTheme,
  userPrincipal = "investigator",
  userClearance = "LEVEL 2: COMPLIANCE OFFICER"
}) {
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Command Dashboard";
      case "trace":
        return "MuleTrace Visualizer";
      case "sandbox":
        return "Behavioral Sandbox";
      case "sar":
        return "SAR Report Desk";
      default:
        return "MuleTrace Command";
    }
  };

  return (
    <header className="border-b border-white/10 bg-[#080808]/90 backdrop-blur-xl px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-30">
      {/* Platform Branding */}
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-emerald-400 rounded-xl rotate-12 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/10">
          <Shield className="w-5 h-5 text-black -rotate-12" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-white uppercase tracking-[0.15em] font-sans">
              MULETRACE.AI
            </h1>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/20 uppercase tracking-widest font-bold">
              LIVE GATEWAY
            </span>
          </div>
          <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mt-0.5">
            {getTabTitle()} // BUILD 0.9.0
          </p>
        </div>
      </div>

      {/* Middle Search & Time */}
      <div className="flex flex-wrap items-center gap-4 flex-1 max-w-xl md:justify-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Account, UPI ID or Hash..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
          />
        </form>

        {/* Live Clock Tracker */}
        <div className="hidden lg:flex items-center gap-2 bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-white/50 text-[10px] font-mono uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Right Telemetry Controls */}
      <div className="flex items-center justify-between md:justify-end gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] font-mono uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-white/40">Heuristics Engine:</span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>

        {/* Profile and Settings */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-white/60 hover:text-white bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

          <button 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-80 active:scale-95 transition-all group"
            title="View Investigator Profile"
          >
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                {userPrincipal === "investigator" ? "Insp. S. Reddy" : userPrincipal}
              </div>
              <div className="text-[9px] text-cyan-400 font-mono uppercase tracking-tight max-w-[170px] truncate" title={userClearance}>
                {userClearance}
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 group-hover:border-cyan-500/40 flex items-center justify-center text-white text-xs font-bold font-mono shadow-md uppercase transition-colors">
              {userPrincipal.substring(0, 2)}
            </div>
          </button>
        </div>
      </div>

      {/* Investigator Personal Info Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300 text-left">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#080808]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Investigator Profile</h3>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Internal Directory Access</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Details Card */}
            <div className="p-6 space-y-5">
              
              {/* Avatar and Name */}
              <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 p-[1px]">
                  <div className="w-full h-full rounded-2xl bg-[#0c0c0c] flex items-center justify-center text-white text-sm font-black font-mono">
                    SR
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">Sudhir Reddy</h4>
                  <p className="text-xs text-cyan-400 font-mono">Insp. S. Reddy</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] text-white/50 uppercase font-mono tracking-widest">Active Session</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-0.5 font-mono">Clearance Level</span>
                    <span className="font-bold text-white font-mono uppercase text-[10px] text-cyan-400">{userClearance}</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-0.5 font-mono">Badge ID</span>
                    <span className="font-bold text-white font-mono text-[10px]">FCIU-9029-SR</span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                  <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-1 font-mono">Official Email</span>
                  <div className="flex items-center gap-2 text-white/80 font-mono text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-white/30" />
                    <span>sudhirreddy1290@gmail.com</span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                  <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-1 font-mono">Department & Assignment</span>
                  <div className="text-[11px] text-white/80 space-y-1">
                    <div><strong className="text-white">Dept:</strong> Financial Crime Investigation Unit (FCIU)</div>
                    <div><strong className="text-white">Focus:</strong> India UPI Network & Mule Account Detection</div>
                  </div>
                </div>
              </div>

              {/* Footer info/Status */}
              <div className="bg-cyan-950/10 border border-cyan-500/10 p-3.5 rounded-xl flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                <p className="text-[10px] text-white/60 leading-relaxed font-mono">
                  This identity card contains encrypted cryptographic clearance tokens. Authorized personnel only.
                </p>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-white transition-all cursor-pointer"
              >
                Acknowledge & Close
              </button>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}

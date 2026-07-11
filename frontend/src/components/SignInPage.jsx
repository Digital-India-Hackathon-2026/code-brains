import React, { useState } from "react";
import { Shield, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SignInPage({ onSignInSuccess }) {
  const [username, setUsername] = useState("investigator");
  const [password, setPassword] = useState("muletrace_secure");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Please enter a username.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    setIsLoading(true);

    // Brief loading simulation for visual transition
    setTimeout(() => {
      if (
        username.toLowerCase() === "investigator" && 
        password === "muletrace_secure"
      ) {
        setIsLoading(false);
        onSignInSuccess(username, "LEVEL 2: COMPLIANCE OFFICER");
      } else {
        setIsLoading(false);
        setErrorMessage("Invalid credentials. Try investigator / muletrace_secure");
      }
    }, 800);
  };

  const handleQuickFill = () => {
    setUsername("investigator");
    setPassword("muletrace_secure");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] text-[#e0e0e0] flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Decorative ambient neon background glows */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Simplified Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white/[0.03] border border-white/10 rounded-2xl shadow-xl mb-1">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-white">
            MULETRACE.AI
          </h1>
          <p className="text-[10px] text-white/40 tracking-wider uppercase font-mono">
            Federal Money Mule Portal
          </p>
        </div>

        {/* Simple Login Card */}
        <div className="bg-[#0c0c0c]/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative">
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="text-center border-b border-white/5 pb-4 mb-2">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Investigator Sign In
              </h2>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3 rounded-xl text-xs font-mono uppercase flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="text-[10px] tracking-wide">{errorMessage}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="investigator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-white/20 rounded-xl font-mono text-xs focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="muletrace_secure"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-white/20 rounded-xl font-mono text-xs focus:outline-none transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Assist Button */}
            <div className="flex items-center justify-between text-[10px] font-mono text-white/30 pt-1">
              <span>Sandbox Mode:</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 underline font-bold uppercase tracking-widest cursor-pointer"
              >
                [Reset to Default]
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-40 text-black font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/5 active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Establishing Handshake...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Simplified disclaimer footer */}
        <p className="text-[8px] text-center text-white/20 font-mono tracking-wider max-w-xs mx-auto">
          SECURE COMPLIANCE MONITORING HUB. FOR AUTHORIZED PERSONNEL ONLY.
        </p>

      </div>
    </div>
  );
}

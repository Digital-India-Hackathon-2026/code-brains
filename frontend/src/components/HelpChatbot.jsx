import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  ShieldAlert, 
  MessageSquare, 
  Plus, 
  HelpCircle,
  Play,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Trash2
} from "lucide-react";
import { RiskLevel } from "../types";
import { simulateCopilotResponse } from "../lib/heuristics";

export default function HelpChatbot({ 
  alerts, 
  setAlerts, 
  onGoToTab, 
  showToast 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "bot",
      text: "Greetings. I am the MuleTrace Compliance Co-Pilot. I monitor the live UPI/IMPS networks for suspicious financial flows and money laundering structures.\n\nHow can I assist you with your cyber-forensics investigation or compliance tasks today? Use the quick actions below to manage or test system triggers.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Use client-side simulation helper (which can be replaced by a custom ML agent)
      const history = messages
        .filter(m => !m.isAction)
        .map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }));

      const responseText = await simulateCopilotResponse(textToSend, history);
      
      const botMsg = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMsg = {
        id: "bot-err-" + Date.now(),
        sender: "bot",
        text: "System communication timeout. I am still operating under localized guardrails. Is there a system action I can perform for you?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Resolvers (Direct App Actions)
  const handleUnfreezeAll = () => {
    const frozenCount = alerts.filter(a => a.status === "BLOCKED").length;
    if (frozenCount === 0) {
      const actionMsg = {
        id: "act-" + Date.now(),
        sender: "bot",
        text: "ℹ️ Diagnostics confirm no nodes are currently frozen in the national directory.",
        timestamp: new Date(),
        isAction: true
      };
      setMessages(prev => [...prev, actionMsg]);
      showToast("No frozen nodes to restore.", "info");
      return;
    }

    setAlerts(prev => prev.map(a => a.status === "BLOCKED" ? { ...a, status: "NEW" } : a));
    
    const actionMsg = {
      id: "act-" + Date.now(),
      sender: "bot",
      text: `⚡ SYSTEM UNLEASHED: Restored ${frozenCount} previously locked suspicious node(s) back to ACTIVE/NEW status for continuous monitoring.`,
      timestamp: new Date(),
      isAction: true
    };
    setMessages(prev => [...prev, actionMsg]);
    showToast(`Restored ${frozenCount} accounts to ACTIVE monitoring state.`, "success");
  };

  const handleTriggerMockAlert = () => {
    const randomSurnames = ["Sharma", "Verma", "Reddy", "Patel", "Nair", "Joshi", "Das", "Singh"];
    const randomFirstnames = ["Rohan", "Ananya", "Vikram", "Pooja", "Siddharth", "Meera", "Karan", "Priyanka"];
    
    const randomSrcName = randomFirstnames[Math.floor(Math.random() * randomFirstnames.length)] + " " + randomSurnames[Math.floor(Math.random() * randomSurnames.length)];
    const randomDestName = randomFirstnames[Math.floor(Math.random() * randomFirstnames.length)] + " " + randomSurnames[Math.floor(Math.random() * randomSurnames.length)];
    
    const newAlertId = "AL-" + (8900 + Math.floor(Math.random() * 1000));
    const randomAmt = Math.floor(80000 + Math.random() * 250000);
    
    const newAlert = {
      id: newAlertId,
      type: "SMURF_FUNNEL",
      riskScore: Math.floor(88 + Math.random() * 11),
      riskLevel: RiskLevel.CRITICAL,
      sourceHolder: randomSrcName,
      sourceAccount: "9091" + Math.floor(100000 + Math.random() * 900000),
      destHolder: randomDestName,
      destAccount: "4045" + Math.floor(100000 + Math.random() * 900000),
      amount: randomAmt,
      status: "NEW",
      timestamp: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev]);

    const actionMsg = {
      id: "act-" + Date.now(),
      sender: "bot",
      text: `🚨 CRITICAL ALERT INJECTED: Detected suspicious funneling patterns on node ${newAlert.destHolder} (${newAlert.id}). Risk rating has escalated to ${newAlert.riskScore}%!`,
      timestamp: new Date(),
      isAction: true
    };
    setMessages(prev => [...prev, actionMsg]);
    showToast(`Injected Critical Threat Alert: ${newAlert.id}`, "error");
  };

  const handleRunDiagnostics = () => {
    const totalAlerts = alerts.length;
    const criticalCount = alerts.filter(a => a.riskLevel === RiskLevel.CRITICAL).length;
    const frozenCount = alerts.filter(a => a.status === "BLOCKED").length;
    const resolvedCount = alerts.filter(a => a.status === "RESOLVED").length;
    const pendingCount = alerts.filter(a => a.status === "NEW" || a.status === "INVESTIGATING").length;

    const rating = frozenCount + resolvedCount >= criticalCount ? "STABLE" : "VULNERABLE (Action Required)";

    const report = `🛠️ SYSTEM COMPLIANCE DIAGNOSTICS REPORT
----------------------------------------------
• Global Monitor Status: ONLINE & STABLE
• Total Monitored Alert Trails: ${totalAlerts}
• Critical Threat Vectors Active: ${criticalCount}
• Active Hold (Frozen) Accounts: ${frozenCount}
• Audited/Resolved Alerts: ${resolvedCount}
• Unresolved Investigator Queue: ${pendingCount}
• Compliance Defense Posture: ${rating}
----------------------------------------------
Investigator Recommendation: Resolve remaining ${pendingCount} pending alerts or file SAR reports to lock potential money mule exit nodes immediately.`;

    const actionMsg = {
      id: "act-" + Date.now(),
      sender: "bot",
      text: report,
      timestamp: new Date(),
      isAction: true
    };
    setMessages(prev => [...prev, actionMsg]);
    showToast("Diagnostics scan completed.", "success");
  };

  const handleSuggestQuestion = (question) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* Floating Hover Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            id="hover-chatbot-trigger"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
            title="Ask MuleTrace Compliance AI Helper"
          >
            {/* Pulsing indicator ring */}
            <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"></span>
            
            <Bot className="w-6 h-6 text-black group-hover:rotate-12 transition-transform duration-300" />
            
            {/* Hover Tooltip tooltip */}
            <span className="absolute right-16 bg-[#0c0c0c] border border-white/15 text-white/90 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl shadow-black/80">
              ⚡ COMPLIANCE ASSISTANT
            </span>
          </button>
        )}

        {/* Floating Expandable Chat Panel */}
        {isOpen && (
          <div 
            id="hover-chatbot-panel"
            className="w-96 sm:w-[410px] h-[550px] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/90 transition-all duration-300 animate-in fade-in zoom-in-95"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0c0c0c] to-[#121212] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-cyan-400" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0c0c0c] rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                    MuleTrace Agent
                    <span className="text-[7px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest">
                      ONLINE
                    </span>
                  </h3>
                  <p className="text-[8px] text-white/40 font-mono uppercase tracking-widest">AML Compliance & Quick Resolver</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Minimize Button */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 border border-white/10 text-white/40 hover:text-white bg-transparent hover:bg-white/5 rounded-lg transition-colors"
                  title="Minimize Chat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-gradient-to-b from-black/25 to-black/5 flex flex-col">
              {messages.map((msg) => {
                if (msg.isAction) {
                  return (
                    <div key={msg.id} className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3.5 my-1 text-[10px] font-mono text-cyan-300 leading-relaxed max-w-full">
                      {msg.text.split("\n").map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                      <div className="text-[8px] text-cyan-400/40 mt-1.5 text-right uppercase tracking-widest">
                        Action Confirmed // {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  );
                }

                const isUser = msg.sender === "user";
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-white/30">
                        {isUser ? "Investigator (You)" : "MuleTrace Co-Pilot"}
                      </span>
                      <span className="text-[8px] font-mono text-white/20">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-3 max-w-[85%] text-xs leading-relaxed ${
                      isUser 
                        ? "bg-cyan-600 text-black font-semibold rounded-2xl rounded-tr-none shadow-lg shadow-cyan-500/5" 
                        : "bg-white/[0.04] border border-white/10 text-white/90 rounded-2xl rounded-tl-none whitespace-pre-wrap"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              
              {isLoading && (
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-white/30 mb-1">Co-Pilot is compiling...</span>
                  <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Panel */}
            <div className="px-4 py-3 bg-[#0a0a0a]/80 border-t border-white/10 flex flex-col gap-2 shrink-0">
              <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest font-bold">
                ⚡ Interactive System Resolvers
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleUnfreezeAll}
                  className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  title="Unfreeze and restore all blocked alert nodes"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Unfreeze Nodes</span>
                </button>
                <button
                  onClick={handleTriggerMockAlert}
                  className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  title="Inject a suspicious funnel threat alert into feeds"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>Trigger Threat</span>
                </button>
                <button
                  onClick={handleRunDiagnostics}
                  className="py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  title="Run compliance database scan and report health"
                >
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Diagnostics Audit</span>
                </button>
                <button
                  onClick={() => {
                    onGoToTab("sar");
                    setIsOpen(false);
                    showToast("Redirected to Suspicious Activity Report portal", "info");
                  }}
                  className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  title="Navigate directly to regulatory SAR portal"
                >
                  <Maximize2 className="w-3 h-3 text-white/40 shrink-0" />
                  <span>SAR Portal</span>
                </button>
              </div>

              {/* Sample Help Suggestions */}
              <div className="flex flex-wrap items-center gap-1 mt-1 pb-1">
                <span className="text-[7px] font-mono text-white/20 uppercase tracking-wider">Help suggestions:</span>
                <button
                  onClick={() => handleSuggestQuestion("What is a money mule structuring chain?")}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[8px] font-mono text-white/50 hover:text-white transition-colors"
                >
                  What is structuring?
                </button>
                <button
                  onClick={() => handleSuggestQuestion("How can I use the Sandboxed Heuristics Rules?")}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[8px] font-mono text-white/50 hover:text-white transition-colors"
                >
                  How to use sandbox?
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="px-4 py-3 border-t border-white/10 flex items-center gap-2 bg-[#0c0c0c] shrink-0"
            >
              <input
                type="text"
                placeholder="Ask compliance agent or search logs..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black rounded-xl transition-all shadow-lg shadow-cyan-500/10 shrink-0 flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { AccountType, RiskLevel } from "../types";
import { sandboxScenarios } from "../data";
import { Info, ShieldAlert, CheckCircle2, RefreshCw, Send, AlertTriangle, Play, HelpCircle, FileText, ArrowRight, ShieldX, Check, Maximize2, Minimize2 } from "lucide-react";

export default function MuleTraceView({ initialScenarioId = "sc-gold-smurf", onGoToSar }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(initialScenarioId);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [frozenAccounts, setFrozenAccounts] = useState({});
  const containerRef = useRef(null);
  const outerContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load the current active scenario
  const scenario = sandboxScenarios.find(s => s.id === selectedScenarioId) || sandboxScenarios[0];

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (outerContainerRef.current) {
        if (outerContainerRef.current.requestFullscreen) {
          outerContainerRef.current.requestFullscreen().catch((err) => {
            console.warn("Browser Fullscreen failed:", err);
          });
        } else if (outerContainerRef.current.webkitRequestFullscreen) {
          outerContainerRef.current.webkitRequestFullscreen();
        }
      }
    } else {
      setIsFullscreen(false);
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Sync native fullscreen changes with React state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isNativeFull && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Escape key listener for fallback exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Responsive SVG Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Make height proportional, but in fullscreen, use full available height
        setDimensions({
          width: Math.max(width, 320),
          height: isFullscreen ? Math.max(height, 500) : (width < 640 ? 320 : 400)
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    // Select first node (victim) by default
    if (scenario && scenario.traceNodes.length > 0) {
      setSelectedNodeId(scenario.traceNodes[0].id);
    }
  }, [selectedScenarioId]);

  // Find corresponding BankAccount for active Node details
  const getSelectedBankAccount = () => {
    if (!selectedNodeId) return null;
    const node = scenario.traceNodes.find(n => n.id === selectedNodeId);
    if (!node) return null;
    
    // Attempt match by name/bank
    const matched = scenario.accounts.find(
      acc => acc.holderName.toLowerCase().includes(node.holderName.toLowerCase()) || 
             node.holderName.toLowerCase().includes(acc.holderName.toLowerCase())
    );
    
    if (matched) return matched;
    
    // Default fallback mock account structured from node details
    return {
      accountNumber: "910294" + Math.floor(100000 + Math.random() * 900000),
      holderName: node.holderName,
      bankName: node.bank,
      riskScore: node.riskScore,
      riskLevel: node.riskLevel,
      type: node.type,
      isActive: true,
      dormantPeriodDays: 14,
      phoneLinked: "+91 99012 34567",
      deviceFingerprint: "DEV-FINGERPRINT-X9",
      location: "Forensic Sandbox",
      createdAt: "2025-01-01",
      balance: node.amount
    };
  };

  const activeAccount = getSelectedBankAccount();

  // Handle Account Freezing Toggles
  const handleToggleFreeze = (accountNo) => {
    setFrozenAccounts(prev => ({
      ...prev,
      [accountNo]: !prev[accountNo]
    }));
  };

  // Helper to calculate initial default positions
  const getInitialPositions = (scen, dims) => {
    const positions = {};
    const { width, height } = dims;
    const isMobile = width < 640;

    // Determine active layers in current scenario to avoid squishing
    const activeLayers = Array.from(new Set(scen.traceNodes.map(n => {
      if (n.type === AccountType.VICTIM) return 0;
      if (n.type === AccountType.MULE_L1) return 1;
      if (n.type === AccountType.MULE_L2) return 2;
      if (n.type === AccountType.MULE_L3) return 3;
      return 4;
    }))).sort((a, b) => a - b);

    scen.traceNodes.forEach((node) => {
      let layerIndex = 0;
      switch (node.type) {
        case AccountType.VICTIM:
          layerIndex = 0;
          break;
        case AccountType.MULE_L1:
          layerIndex = 1;
          break;
        case AccountType.MULE_L2:
          layerIndex = 2;
          break;
        case AccountType.MULE_L3:
          layerIndex = 3;
          break;
        case AccountType.EXIT:
          layerIndex = 4;
          break;
        default:
          layerIndex = 2;
      }

      const layerPosition = activeLayers.indexOf(layerIndex);
      const totalActiveLayers = activeLayers.length;

      // X position
      const paddingX = isMobile ? 40 : 80;
      const x = paddingX + (layerPosition / Math.max(1, totalActiveLayers - 1)) * (width - paddingX * 2);

      // Y position (distribute nodes of the same type vertically if multiple exist)
      const nodesInSameLayer = scen.traceNodes.filter(n => n.type === node.type);
      const sameLayerIndex = nodesInSameLayer.findIndex(n => n.id === node.id);
      const totalInSameLayer = nodesInSameLayer.length;

      let y = height / 2;
      if (totalInSameLayer > 1) {
        const paddingY = isMobile ? 30 : 60;
        const step = (height - paddingY * 2) / (totalInSameLayer - 1);
        y = paddingY + sameLayerIndex * step;
      }

      positions[node.id] = { x, y };
    });

    return positions;
  };

  // State to track draggable node positions
  const [nodeCoords, setNodeCoords] = useState(() => getInitialPositions(scenario, dimensions));

  // Keep a ref for high-performance pointer dragging metrics
  const dragRef = useRef({
    nodeId: null,
    startX: 0,
    startY: 0,
    startNodeX: 0,
    startNodeY: 0
  });

  // Track dragging node ID to style canvas or cursor
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Sync state whenever selected scenario or dimensions change
  useEffect(() => {
    setNodeCoords(getInitialPositions(scenario, dimensions));
  }, [selectedScenarioId, dimensions]);

  // Pointer drag event handlers
  const handlePointerDown = (e, nodeId) => {
    setSelectedNodeId(nodeId);
    e.target.setPointerCapture(e.pointerId);
    
    const pos = nodeCoords[nodeId];
    if (pos) {
      dragRef.current = {
        nodeId,
        startX: e.clientX,
        startY: e.clientY,
        startNodeX: pos.x,
        startNodeY: pos.y
      };
      setDraggingNodeId(nodeId);
    }
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag.nodeId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Constrain node to canvas area boundaries
    const newX = Math.max(25, Math.min(dimensions.width - 25, drag.startNodeX + dx));
    const newY = Math.max(25, Math.min(dimensions.height - 25, drag.startNodeY + dy));

    setNodeCoords(prev => ({
      ...prev,
      [drag.nodeId]: { x: newX, y: newY }
    }));
  };

  const handlePointerUp = (e) => {
    const drag = dragRef.current;
    if (drag.nodeId) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe fallback if target has been unmounted or detached
      }
      drag.nodeId = null;
      setDraggingNodeId(null);
    }
  };

  // Rupees formatting helper
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Swapper Case Deck */}
      <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-black/40">
        <div>
          <label className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-2">Select Forensics Intelligence Case</label>
          <div className="flex flex-wrap gap-2">
            {sandboxScenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest font-mono border transition-all ${
                  selectedScenarioId === sc.id
                    ? "bg-white text-black border-white shadow-lg shadow-white/10"
                    : "bg-[#080808] text-white/50 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {sc.title.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="text-right font-mono text-[10px] uppercase tracking-widest text-white/30 hidden lg:block">
          <span>Active Case ID: <strong className="text-white/70 font-bold">{scenario.id.toUpperCase()}</strong></span>
        </div>
      </div>

      {/* Main Sandbox Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: SVG Tracing Canvas */}
        <div 
          ref={outerContainerRef}
          className={`bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group shadow-xl shadow-black/40 transition-all duration-300 ${
            isFullscreen 
              ? "fixed inset-0 z-50 bg-[#080808] w-screen h-screen p-8" 
              : "lg:col-span-2 min-h-[400px]"
          }`}
        >
          {/* Subtle grid background to look like a high-tech tracking screen */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

          {/* Canvas Header info */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between z-10 mb-4 bg-[#080808]/80 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-wider">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 animate-pulse"></span>
              <span className="text-white/80 font-bold">Tracing Flow: {scenario.title}</span>
              <span className="text-[8px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-lg font-mono font-bold tracking-widest">
                DRAG NODES
              </span>
              <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-mono font-bold tracking-widest">
                CLICK BACKGROUND TO {isFullscreen ? "MINIMIZE" : "FULLSCREEN"}
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-[10px] text-white/40 font-mono hidden md:inline-block">
                Mules: {scenario.metrics.muleCount}
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer text-[10px] font-mono font-bold uppercase tracking-wider"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SVG Workspace Container */}
          <div ref={containerRef} className="flex-1 w-full bg-[#080808]/40 rounded-xl relative overflow-hidden flex items-center justify-center border border-white/5">
            <svg
              width={dimensions.width}
              height={dimensions.height}
              className={`absolute inset-0 select-none transition-colors ${draggingNodeId ? "cursor-grabbing bg-white/[0.01]" : "cursor-grab"}`}
              style={{ minHeight: "320px" }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Invisible/Clickable background to catch zoom click & double-clicks */}
              <rect
                width="100%"
                height="100%"
                fill="transparent"
                onClick={toggleFullscreen}
                className={`transition-all ${isFullscreen ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              />
              {/* SVG Filters for glowing drop-shadows */}
              <defs>
                <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Draw Edges / Connections with animated pulse */}
              {scenario.traceEdges.map((edge) => {
                const sourcePos = nodeCoords[edge.source];
                const targetPos = nodeCoords[edge.target];
                if (!sourcePos || !targetPos) return null;

                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                // Truncate line endpoints to prevent overlaps with circles
                const nodeRadius = 18;
                const sourceX = sourcePos.x + (dx / dist) * nodeRadius;
                const sourceY = sourcePos.y + (dy / dist) * nodeRadius;
                const targetX = targetPos.x - (dx / dist) * (nodeRadius + 4);
                const targetY = targetPos.y - (dy / dist) * (nodeRadius + 4);

                return (
                  <g key={edge.id}>
                    {/* Background wide glowing flow trail */}
                    <line
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      stroke={edge.isSuspicious ? "rgba(244, 63, 94, 0.1)" : "rgba(255, 255, 255, 0.02)"}
                      strokeWidth={6}
                    />

                    {/* Core Line */}
                    <line
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      stroke={edge.isSuspicious ? "#f43f5e" : "rgba(255, 255, 255, 0.2)"}
                      strokeWidth={1.5}
                      strokeDasharray={edge.isSuspicious ? "4 4" : "0"}
                      className={edge.isSuspicious ? "animate-pulse" : ""}
                    />

                    {/* Animated Pulsing Ball traveling along the money line */}
                    {edge.isSuspicious && (
                      <circle r={3} fill="#f43f5e">
                        <animateMotion
                          path={`M ${sourceX} ${sourceY} L ${targetX} ${targetY}`}
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Money flow tag overlay */}
                    <foreignObject
                      x={(sourceX + targetX) / 2 - 35}
                      y={(sourceY + targetY) / 2 - 10}
                      width={70}
                      height={20}
                    >
                      <div className="bg-[#080808] border border-white/10 rounded-lg px-1 py-0.5 text-[8px] font-mono text-center text-white/80 leading-none truncate uppercase tracking-wider">
                        {formatINR(edge.amount).replace("INR", "₹")}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {scenario.traceNodes.map((node, index) => {
                const pos = nodeCoords[node.id];
                if (!pos) return null;

                const isSelected = selectedNodeId === node.id;
                const matchedAcc = scenario.accounts.find(
                  acc => acc.holderName.toLowerCase().includes(node.holderName.toLowerCase()) || 
                         node.holderName.toLowerCase().includes(acc.holderName.toLowerCase())
                );
                const isFrozen = matchedAcc ? frozenAccounts[matchedAcc.accountNumber] : false;

                // Color themes based on node role
                let nodeColor = "#3b82f6"; // Blue
                let shadowFilter = "";

                if (node.type === AccountType.VICTIM) {
                  nodeColor = "#10b981"; // Emerald
                  shadowFilter = "url(#glow-emerald)";
                } else if (node.type === AccountType.EXIT) {
                  nodeColor = "#f43f5e"; // Rose
                  shadowFilter = "url(#glow-rose)";
                } else if (node.riskLevel === RiskLevel.CRITICAL) {
                  nodeColor = "#f43f5e"; // Rose
                  shadowFilter = "url(#glow-rose)";
                } else if (node.riskLevel === RiskLevel.HIGH) {
                  nodeColor = "#f59e0b"; // Amber
                  shadowFilter = "url(#glow-amber)";
                }

                // If investigator overrode status and froze the account, turn it grey with rose lock ring
                if (isFrozen) {
                  nodeColor = "#64748b";
                }

                return (
                  <g
                     key={node.id}
                     onPointerDown={(e) => handlePointerDown(e, node.id)}
                     onClick={(e) => e.stopPropagation()}
                     className="cursor-pointer group select-none"
                  >
                     {/* Node base glow on selection */}
                     {isSelected && (
                       <circle
                         cx={pos.x}
                         cy={pos.y}
                         r={24}
                         fill="none"
                         stroke={isFrozen ? "#f43f5e" : nodeColor}
                         strokeWidth={2}
                         strokeDasharray="3 2"
                         className="animate-spin"
                         style={{ transformOrigin: `${pos.x}px ${pos.y}px`, animationDuration: "10s" }}
                       />
                     )}

                     {/* Outer hover ring */}
                     <circle
                       cx={pos.x}
                       cy={pos.y}
                       r={isSelected ? 18 : 16}
                       fill={isSelected ? "#080808" : "rgba(12, 12, 12, 0.95)"}
                       stroke={nodeColor}
                       strokeWidth={isSelected ? 2.5 : 1.5}
                       filter={isSelected ? shadowFilter : ""}
                       className="transition-all duration-300"
                     />

                     {/* Frozen / Active Symbol overlay inside core circle */}
                     {isFrozen ? (
                       <text
                         x={pos.x}
                         y={pos.y + 3.5}
                         fill="#f43f5e"
                         fontSize="10px"
                         fontWeight="bold"
                         textAnchor="middle"
                         fontFamily="monospace"
                       >
                         🔒
                       </text>
                     ) : (
                       <text
                         x={pos.x}
                         y={pos.y + 3.5}
                         fill={nodeColor}
                         fontSize="9px"
                         fontWeight="bold"
                         textAnchor="middle"
                         fontFamily="monospace"
                       >
                         {node.type === AccountType.VICTIM ? "VIC" : node.type === AccountType.EXIT ? "EXIT" : `L${node.type.includes("1") ? "1" : node.type.includes("2") ? "2" : "3"}`}
                       </text>
                     )}

                     {/* Bank & Label Text placed underneath the node */}
                     <text
                       x={pos.x}
                       y={pos.y + 30}
                       fill={isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.4)"}
                       fontSize="9px"
                       fontWeight={isSelected ? "bold" : "normal"}
                       textAnchor="middle"
                       fontFamily="monospace"
                       className="transition-all uppercase tracking-wider"
                     >
                       {node.label}
                     </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Graph Legend Overlay */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-[9px] font-mono uppercase tracking-widest text-white/40 z-10">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500"></span>
              <span>Victim Account</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500"></span>
              <span>Layering Mule</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500"></span>
              <span>Critical/Exit</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-600 flex items-center justify-center text-[7px]">🔒</span>
              <span>Frozen Node</span>
            </span>
          </div>
        </div>

        {/* Right 1 Column: Immersive Forensics Node Inspector Panel */}
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-black/40">
          {activeAccount ? (
            <div className="space-y-5">
              {/* Inspector Header */}
              <div className="pb-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-xl font-mono border border-white/10 text-white/70 uppercase tracking-widest">
                    FORENSICS AUDIT
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-xl uppercase tracking-wider border ${
                    frozenAccounts[activeAccount.accountNumber]
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {frozenAccounts[activeAccount.accountNumber] ? "🔒 FROZEN STATE" : "● LIVE STATE"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-3 font-sans uppercase tracking-wider leading-tight">
                  {activeAccount.holderName}
                </h3>
                <p className="text-xs text-white/40 font-mono mt-1">
                  {activeAccount.bankName} • Account: {activeAccount.accountNumber}
                </p>
              </div>

              {/* Heuristics metrics list */}
              <div className="space-y-3.5">
                {/* Score Dial */}
                <div className="bg-[#080808]/60 backdrop-blur rounded-xl p-4 border border-white/10 flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke={activeAccount.riskScore >= 75 ? "#f43f5e" : activeAccount.riskScore >= 40 ? "#f59e0b" : "#10b981"}
                        strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 24}
                        strokeDashoffset={2 * Math.PI * 24 * (1 - activeAccount.riskScore / 100)}
                      />
                    </svg>
                    <span className="text-xs font-mono font-bold text-white">
                      {activeAccount.riskScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Mule Score: {activeAccount.riskLevel}
                    </h4>
                    <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                      Composite weighting based on dormancy wakeup and transfer velocity rules.
                    </p>
                  </div>
                </div>

                {/* Audit Fields */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono uppercase tracking-wider">
                  <div className="bg-[#080808]/40 p-3 rounded-xl border border-white/10">
                    <div className="text-[8px] text-white/30 font-bold">LINKED MOBILE</div>
                    <div className="text-white/80 font-bold truncate mt-1">{activeAccount.phoneLinked}</div>
                  </div>
                  <div className="bg-[#080808]/40 p-3 rounded-xl border border-white/10">
                    <div className="text-[8px] text-white/30 font-bold">GEOLOCATION IP</div>
                    <div className="text-white/80 font-bold truncate mt-1">{activeAccount.location}</div>
                  </div>
                  <div className="bg-[#080808]/40 p-3 rounded-xl border border-white/10 col-span-2">
                    <div className="text-[8px] text-white/30 font-bold">DEVICE FINGERPRINT</div>
                    <div className="text-white/80 font-bold truncate mt-1">{activeAccount.deviceFingerprint}</div>
                  </div>
                  <div className="bg-[#080808]/40 p-3 rounded-xl border border-white/10">
                    <div className="text-[8px] text-white/30 font-bold">DORMANCY PERIOD</div>
                    <div className="text-white/80 font-bold mt-1">{activeAccount.dormantPeriodDays} Days</div>
                  </div>
                  <div className="bg-[#080808]/40 p-3 rounded-xl border border-white/10">
                    <div className="text-[8px] text-white/30 font-bold">FLOW ROLE</div>
                    <div className="text-emerald-400 font-bold mt-1">{activeAccount.type}</div>
                  </div>
                </div>
              </div>

              {/* Investigator Action Deck */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                {/* 1. Toggle Freeze */}
                <button
                  onClick={() => handleToggleFreeze(activeAccount.accountNumber)}
                  className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                    frozenAccounts[activeAccount.accountNumber]
                      ? "bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400"
                      : "bg-rose-600 text-white border-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {frozenAccounts[activeAccount.accountNumber] ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Lift Account Freeze</span>
                    </>
                  ) : (
                    <>
                      <ShieldX className="w-4 h-4 shrink-0" />
                      <span>Freeze Account Node</span>
                    </>
                  )}
                </button>

                {/* 2. File SAR */}
                {activeAccount.type !== AccountType.VICTIM && (
                  <button
                    onClick={() => onGoToSar(activeAccount)}
                    className="w-full py-2.5 px-4 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-white/40" />
                    <span>File SAR regulatory Report</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
              <Info className="w-10 h-10 text-white/20 mb-2" />
              <p className="text-white/60 text-xs font-mono uppercase tracking-widest">No Node Selected</p>
              <p className="text-white/30 text-[10px] font-mono mt-1 uppercase tracking-wider px-4">Select any node in the tracing trail map to initiate forensic inspection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";

const translations = {
  en: {
    subtitle: "Live Autonomous Fund Manager",
    agentOnline: "Agent Online",
    agentOffline: "Agent Offline",
    waitingPython: "Waiting for python main.py",
    brainStateTitle: "Live Core Brain State",
    sentiment: "GPT-4 Sentiment",
    offline: "OFFLINE",
    buySignal: "EXTREME GREED - SIGNAL BUY",
    sellSignal: "EXTREME FEAR - SIGNAL SELL",
    neutralSignal: "NEUTRAL - HOLDING ASSETS",
    logicConsole: "Real-Time Logic Console",
    waitingEngine: "Waiting for AI engine to start polling market...",
    cannotReach: "Cannot reach background server. Please start 'python main.py' to pipe logs here.",
    onChainEx: "Real On-Chain Executions",
    awaitingThresholds: "Awaiting actionable thresholds to execute swap transactions on Monad Network...",
    target: "Monad DEX Target",
    toggleLang: "🇹🇷 TR"
  },
  tr: {
    subtitle: "Canlı Otonom Fon Yöneticisi",
    agentOnline: "Ajan Bağlı",
    agentOffline: "Bağlantı Yok",
    waitingPython: "python main.py bekleniyor",
    brainStateTitle: "Canlı Beyin Durumu",
    sentiment: "GPT-4 Duygusu",
    offline: "ÇEVRİMDIŞI",
    buySignal: "AŞIRI İŞTAH - ALIM SİNYALİ",
    sellSignal: "AŞIRI KORKU - SATIŞ SİNYALİ",
    neutralSignal: "NÖTR - PİYASA İZLENİYOR",
    logicConsole: "Yapay Zeka Mantık Konsolu",
    waitingEngine: "Yapay zeka motorunun piyasayı taramaya başlaması bekleniyor...",
    cannotReach: "Arka plan sunucusuna ulaşılamıyor. Lütfen terminalden 'python main.py' başlatın.",
    onChainEx: "Gerçek Zincir İçi İşlemler",
    awaitingThresholds: "Monad Ağında işlem yapmak için puan barajının aşılması bekleniyor...",
    target: "Monad DEX Hedefi",
    toggleLang: "🇬🇧 EN"
  }
};

export default function Home() {
  const [lang, setLang] = useState<"en" | "tr">("en");
  const [score, setScore] = useState(0);
  const [logs, setLogs] = useState<{ id: number; text: string; type: "info" | "action" | "reason"; timestamp: string }[]>([]);
  const [trades, setTrades] = useState<{ id: number; action: string; hash: string }[]>([]);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    // Keep the terminal log scrolled to the bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/state");
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        
        setScore(data.score);
        setLogs(data.logs);
        setTrades(data.trades);
        setConnected(true);
      } catch (err) {
        setConnected(false);
        // Hata durumunda sadece değişkeni güncelleyip sessizce bekler.
      }
    };

    // Initial fetch
    fetchState();
    // Poll every 2 seconds
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 relative overflow-hidden bg-[#06020c]">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-monad-purple rounded-full mix-blend-screen filter blur-[150px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neon-blue rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="flex justify-between items-center glass-panel px-6 py-4 rounded-2xl z-10 animate-slide-down">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-monad-purple/20 border border-monad-purple rounded-xl flex items-center justify-center animate-glow text-2xl font-bold">
            🧠
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">NeuroVault AI</h1>
            <p className="text-xs md:text-sm text-monad-purple/80 font-mono tracking-wider uppercase drop-shadow">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === "en" ? "tr" : "en")}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xs font-bold transition-all cursor-pointer"
          >
            {t.toggleLang}
          </button>
          
          <div className="hidden md:flex flex-col text-right">
            <span className={`text-sm font-bold tracking-widest uppercase ${connected ? "text-neon-blue" : "text-red-500"}`}>
              {connected ? t.agentOnline : t.agentOffline}
            </span>
            <span className="text-xs text-gray-400">{connected ? "Monad Testnet RPC" : t.waitingPython}</span>
          </div>
          <div className={`w-4 h-4 rounded-full shadow-[0_0_15px] ${connected ? "bg-neon-blue shadow-[#00e5ff] animate-pulse" : "bg-red-500 shadow-red-500"}`}></div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 z-10 w-full h-full pb-8">
        
        {/* Left Column: Sentiment Dashboard */}
        <section className="glass-panel p-6 rounded-3xl flex flex-col gap-6 animate-slide-down" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-mono font-semibold text-gray-300 border-b border-white/10 pb-3 flex items-center gap-2">
            <span>📡</span> {t.brainStateTitle}
          </h2>
          
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div className="relative w-56 h-56 flex items-center justify-center drop-shadow-2xl">
              {/* Circular Meter */}
              <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" 
                  stroke={score > 80 ? '#00e5ff' : score < -80 ? '#ff0055' : '#836ef9'} 
                  strokeWidth="8" 
                  strokeDasharray={`${Math.abs(score) * 2.8} 280`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center p-6 rounded-full">
                 <span className="text-5xl font-black drop-shadow-md" style={{ color: score > 80 ? '#00e5ff' : score < -80 ? '#ff0055' : 'white' }}>
                   {score > 0 ? `+${score}` : score}
                 </span>
                 <span className="text-xs text-gray-400 font-mono uppercase tracking-widest mt-2">{connected ? t.sentiment : "N/A"}</span>
              </div>
            </div>
            
            <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5 text-center mt-4 shadow-inner">
              <p className="text-sm font-bold tracking-wider" style={{ color: score > 80 ? '#00e5ff' : score < -80 ? '#ff0055' : '#836ef9' }}>
                {!connected ? t.offline : score > 80 ? t.buySignal : score < -80 ? t.sellSignal : t.neutralSignal}
              </p>
            </div>
          </div>
        </section>

        {/* Middle Column: Terminal Feed (Actual Python Logs) */}
        <section className="glass-panel p-6 rounded-3xl flex flex-col gap-4 animate-slide-down lg:col-span-1" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-mono font-semibold text-gray-300 border-b border-white/10 pb-3 flex items-center gap-2">
            <span>⚡</span> {t.logicConsole}
          </h2>
          <div className="flex-1 bg-[#030108]/80 border border-white/5 rounded-2xl p-5 font-mono text-[13px] overflow-y-auto h-96 shadow-inner" ref={scrollRef}>
             {logs.length === 0 && connected && (
                <div className="text-gray-500 text-center mt-10 animate-pulse">{t.waitingEngine}</div>
             )}
             {!connected && (
                <div className="text-red-500/80 text-center mt-10">{t.cannotReach}</div>
             )}
            {logs.map(log => (
              <div key={log.id} className={`mb-4 leading-relaxed ${log.type === 'action' ? 'text-neon-blue font-bold drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]' : log.type === 'reason' ? 'text-monad-purple font-medium' : 'text-gray-400'}`}>
                <span className="opacity-40 mr-2 text-[11px] select-none">[{log.timestamp}]</span>
                <span className={log.type === 'action' ? 'animate-pulse' : ''}>{log.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Execution History */}
        <section className="glass-panel p-6 rounded-3xl flex flex-col gap-4 animate-slide-down" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-mono font-semibold text-gray-300 border-b border-white/10 pb-3 flex items-center gap-2">
            <span>⛓️</span> {t.onChainEx}
          </h2>
          
          <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-96 pr-2">
            {trades.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500/60 p-10 font-mono text-sm">
                <div className="animate-pulse mb-3 text-2xl duration-1000">⏳</div>
                {t.awaitingThresholds}
              </div>
            ) : (
              trades.map((trade) => (
                <div key={trade.id} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-3 transition-all hover:bg-black/50 animate-slide-down">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-md text-xs font-black tracking-widest ${trade.action === 'BUY' ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30' : 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30'}`}>
                      {trade.action}
                    </div>
                    <div className="text-xs font-mono text-gray-400">{t.target}</div>
                  </div>
                  <div className="flex items-center justify-between bg-black/60 px-3 py-2 rounded border border-white/5">
                    <span className="text-[10px] text-gray-500">TX HASH</span>
                    <a href={`https://testnet.monadexplorer.com/tx/${trade.hash}`} target="_blank" rel="noreferrer" className="text-xs text-monad-purple font-mono cursor-pointer hover:underline truncate ml-2">
                      {trade.hash}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

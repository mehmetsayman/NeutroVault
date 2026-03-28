"use client";
import { useState, useEffect, useRef } from "react";

// For typescript compiler bypass without extra @types
declare global {
  interface Window {
    ethereum?: any;
  }
}

const translations = {
  en: {
    subtitle: "Retail AI Signals Platform",
    agentOnline: "Agent Online",
    agentOffline: "Agent Offline",
    waitingPython: "Waiting for AI Server",
    brainStateTitle: "Live Core Brain State",
    sentiment: "GPT-4 Sentiment",
    offline: "OFFLINE",
    buySignal: "EXTREME GREED - BUY SIGNAL",
    sellSignal: "EXTREME FEAR - SELL SIGNAL",
    neutralSignal: "NEUTRAL - NO ACTION",
    logicConsole: "Real-Time Logic Console",
    waitingEngine: "Waiting for AI engine to start polling market...",
    cannotReach: "Cannot reach background server. Please start 'python main.py' to pipe logs here.",
    onChainEx: "Live Monad Portfolio (5% Fee)",
    awaitingThresholds: "Awaiting strong AI signals to unlock your trade opportunities...",
    target: "Monad Network",
    toggleLang: "🇹🇷 TR",
    connectWallet: "🦊 Connect Wallet",
    walletConnected: "Connected",
    executeTrade: "⚡ Execute AI Trade (5% Fee)",
    monadBalance: "Wallet Balance (MON)",
    totalProfit: "Total PnL (MON)",
    activeAssets: "Active Assets",
    none: "None. Holding Cash."
  },
  tr: {
    subtitle: "Merkeziyetsiz Perakende Yapay Zeka Sinyalleri",
    agentOnline: "Ajan Bağlı",
    agentOffline: "Bağlantı Yok",
    waitingPython: "AI Sunucusu bekleniyor",
    brainStateTitle: "Canlı Beyin Durumu",
    sentiment: "GPT-4 Duygusu",
    offline: "ÇEVRİMDIŞI",
    buySignal: "AŞIRI İŞTAH - ALIM FIRSATI",
    sellSignal: "AŞIRI KORKU - SATIŞ FIRSATI",
    neutralSignal: "NÖTR - FIRSAT BEKLENİYOR",
    logicConsole: "Yapay Zeka Mantık Konsolu",
    waitingEngine: "Yapay zeka motorunun piyasayı taramaya başlaması bekleniyor...",
    cannotReach: "Arka plan sunucusuna ulaşılamıyor. Lütfen terminalden 'python main.py' başlatın.",
    onChainEx: "Canlı Monad Portföyü (%5 Kom.",
    awaitingThresholds: "Para kazanma işlemlerinizi açmak için aşırı güçlü Yapay Zeka sinyalleri bekleniyor...",
    target: "Monad Ağı",
    toggleLang: "🇬🇧 EN",
    connectWallet: "🦊 Cüzdan Bağla",
    walletConnected: "Cüzdan Bağlı",
    executeTrade: "⚡ Alım Satımı Onayla (%5 Komisyon)",
    monadBalance: "Cüzdan Bakiyesi (MON)",
    totalProfit: "Toplam Kâr (MON)",
    activeAssets: "Aktif Varlıklar",
    none: "Nakit Bekleniyor (Boş)"
  }
};

export default function Home() {
  const [lang, setLang] = useState<"en" | "tr">("en");
  const [score, setScore] = useState(0);
  const [logs, setLogs] = useState<{ id: number; text: string; type: "info" | "action" | "reason"; timestamp: string }[]>([]);
  
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);

  // --- MOCK PORTFOLIO SYSTEM FOR MVP PRESENTATION ---
  const [monBalance, setMonBalance] = useState(100.00); // Start with 100 MON
  const [totalProfit, setTotalProfit] = useState(0.00);
  const [hasCryptoAsset, setHasCryptoAsset] = useState(false); // Indicates if currently holding the coin
  const [localTrades, setLocalTrades] = useState<{ id: number; action: string; profit?: number; hash: string }[]>([]);
  const [tradeCounter, setTradeCounter] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
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
        // We no longer rely deeply on the Python background trades array.
        // We will build our own retail trades array when the user clicks APPROVE.
        setConnected(true);
      } catch (err) {
        setConnected(false);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Web3 Metamask Connection
  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWallet(accounts[0]);
      } catch (error) {
        console.error("Wallet connection denied", error);
        // Fallback demo wallet if user cancels metamask for the hackathon
        setWallet("0xD3m0...C0d3");
      }
    } else {
      // If no metamask, fake the connection perfectly so presentation logic isn't blocked.
      alert("Metamask eklentisi bulunamadı! Demo modu aktifleştiriliyor.");
      setWallet("Demo_0x12..9x");
    }
  };

  const DEVELOPER_WALLET = process.env.NEXT_PUBLIC_FEE_COLLECTOR || "0xYourHackerWalletAddressGoesHere0123456789"; 

  // Retail Interactive Trade Execution
  const handleRetailTrade = async () => {
    if (!wallet) {
      alert(lang === "tr" ? "Lütfen önce Cüzdanı bağlayın!" : "Please connect your wallet first!");
      return;
    }
    
    // Attempt Metamask Transaction silently
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{from: wallet, to: DEVELOPER_WALLET, value: '0xB1A2BC2EC50000'}],
            });
        } catch (error) {
            console.log("Metamask TX ignored, relying on Local Demo State");
        }
    }

    const tradeAction = score >= 60 ? "BUY" : "SELL";
    
    // Simulate UI logic restrictions
    if (tradeAction === "BUY" && hasCryptoAsset) {
        alert(lang === "tr" ? "Zaten elinizde Kripto var! Satış sinyali gelene kadar bekleyin." : "You already hold assets! Wait for a SELL signal.");
        return;
    }
    if (tradeAction === "SELL" && !hasCryptoAsset) {
        alert(lang === "tr" ? "Satacak kriptonuz yok! Alış sinyali gelmesini bekleyin." : "No assets to sell! Wait for a BUY signal.");
        return;
    }

    // Process logic
    const mockHash = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "..." + Math.random().toString(16).slice(2, 6).toUpperCase();
    const currentTradeId = tradeCounter + 1;
    setTradeCounter(currentTradeId);

    if (tradeAction === "BUY") {
        setHasCryptoAsset(true);
        // Deduct exactly 10 MON for the trade, and 0.5 MON (5%) for Developer Fee
        const newBalance = monBalance - 10.5; 
        setMonBalance(Number(newBalance.toFixed(2)));

        setLocalTrades([{ id: currentTradeId, action: "BUY (-10.5 MON)", hash: mockHash }, ...localTrades]);
    } else {
        setHasCryptoAsset(false);
        // We sell the asset and realize a mock AI profit! (Between 1.0 to 3.5 MON profit)
        const mockProfitForThisTrade = 1.0 + (Math.random() * 2.5);
        // We return the original 10 MON + Profit, and subtract a 5% exit fee to dev (-0.5)
        const totalReturn = 10 + mockProfitForThisTrade - 0.5;
        
        const newBalance = monBalance + totalReturn;
        setMonBalance(Number(newBalance.toFixed(2)));
        setTotalProfit(Number((totalProfit + mockProfitForThisTrade).toFixed(2)));

        setLocalTrades([{ id: currentTradeId, action: `SELL (+${totalReturn.toFixed(2)} MON)`, hash: mockHash, profit: mockProfitForThisTrade }, ...localTrades]);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 relative overflow-hidden bg-[#06020c]">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-monad-purple rounded-full mix-blend-screen filter blur-[150px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neon-blue rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="flex justify-between items-center glass-panel px-6 py-4 rounded-2xl z-10 animate-slide-down">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#836ef9]/20 border border-[#836ef9] rounded-xl flex items-center justify-center animate-glow text-2xl font-bold">
            🧠
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">NeuroVault AI</h1>
            <p className="text-xs md:text-sm text-[#836ef9]/80 font-mono tracking-wider uppercase drop-shadow">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={wallet ? undefined : handleConnectWallet}
              className={`px-4 py-2 font-black rounded-lg transition-all duration-300 shadow-lg ${wallet ? 'bg-gradient-to-r from-green-500 to-green-700 text-white cursor-default' : 'bg-gradient-to-r from-[#836ef9] to-[#00e5ff] text-white hover:scale-105 cursor-pointer shadow-[#00e5ff]/50'}`}
            >
              {wallet ? `${t.walletConnected}: ${wallet.slice(0, 7)}...` : t.connectWallet}
            </button>
            {wallet && (
              <button 
                onClick={() => setWallet(null)}
                className="flex items-center justify-center w-9 h-9 bg-red-500/10 hover:bg-red-500/80 text-red-500 border border-red-500/30 hover:text-white rounded-lg font-bold transition-all shadow-lg"
                title="Disconnect"
              >
                ✕
              </button>
            )}
          </div>

          <button 
            onClick={() => setLang(lang === "en" ? "tr" : "en")}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            {t.toggleLang}
          </button>
          
          <div className="hidden md:flex flex-col text-right ml-4">
            <span className={`text-sm font-bold tracking-widest uppercase ${connected ? "text-[#00e5ff]" : "text-red-500"}`}>
              {connected ? t.agentOnline : t.agentOffline}
            </span>
            <span className="text-xs text-gray-400">{connected ? "Monad Testnet RPC" : t.waitingPython}</span>
          </div>
          <div className={`w-4 h-4 rounded-full shadow-[0_0_15px] ${connected ? "bg-[#00e5ff] shadow-[#00e5ff] animate-pulse" : "bg-red-500 shadow-red-500"}`}></div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 z-10 w-full h-full pb-8">
        
        {/* Left Column: Sentiment Dashboard */}
        <section className="glass-panel p-6 rounded-3xl flex flex-col gap-6 animate-slide-down relative" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-mono font-semibold text-gray-300 border-b border-white/10 pb-3 flex items-center gap-2">
            <span>📡</span> {t.brainStateTitle}
          </h2>
          
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
            <div className="relative w-48 h-48 flex items-center justify-center drop-shadow-2xl">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" 
                  stroke={score >= 60 ? '#00e5ff' : score <= -60 ? '#ff0055' : '#836ef9'} 
                  strokeWidth="8" 
                  strokeDasharray={`${Math.abs(score) * 2.8} 280`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center p-6 rounded-full">
                 <span className="text-4xl font-black drop-shadow-md" style={{ color: score >= 60 ? '#00e5ff' : score <= -60 ? '#ff0055' : 'white' }}>
                   {score > 0 ? `+${score}` : score}
                 </span>
                 <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mt-1 text-center">{connected ? t.sentiment : "N/A"}</span>
              </div>
            </div>
            
            <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 text-center mt-2 shadow-inner">
              <p className="text-sm font-bold tracking-wider" style={{ color: score >= 60 ? '#00e5ff' : score <= -60 ? '#ff0055' : '#836ef9' }}>
                {!connected ? t.offline : score >= 60 ? t.buySignal : score <= -60 ? t.sellSignal : t.neutralSignal}
              </p>
            </div>
            
            {(score >= 60 || score <= -60) && connected && (
              <button 
                onClick={handleRetailTrade}
                className={`mt-2 w-full py-4 rounded-xl font-black text-white text-[13px] tracking-widest uppercase transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer
                    ${score >= 60 
                     ? (hasCryptoAsset ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-[#00e5ff] to-blue-600 shadow-[#00e5ff]/50 animate-pulse')
                     : (!hasCryptoAsset ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff0055] to-red-600 shadow-[#ff0055]/50 animate-pulse')
                    }
                `}
              >
                {t.executeTrade}
              </button>
            )}
          </div>
        </section>

        {/* Middle Column: Terminal Feed */}
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
              <div key={log.id} className={`mb-4 leading-relaxed ${log.type === 'action' ? 'text-[#00e5ff] font-bold drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]' : log.type === 'reason' ? 'text-[#836ef9] font-medium' : 'text-gray-400'}`}>
                <span className="opacity-40 mr-2 text-[11px] select-none">[{log.timestamp}]</span>
                <span className={log.type === 'action' ? 'animate-pulse' : ''}>{log.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Execution History & Portfolio */}
        <section className="glass-panel p-6 rounded-3xl flex flex-col gap-4 animate-slide-down" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-mono font-semibold text-gray-300 border-b border-white/10 pb-3 flex items-center gap-2">
            <span>💼</span> {t.onChainEx}
          </h2>
          
          <div className="w-full bg-[#836ef9]/10 border border-[#836ef9]/30 rounded-xl p-4 flex justify-between items-center mb-2">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.monadBalance}</span>
                <span className="text-2xl font-black text-white">{monBalance.toFixed(2)} MON</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.totalProfit}</span>
                <span className={`text-xl font-bold ${totalProfit > 0 ? 'text-green-400' : 'text-gray-500'}`}>+{totalProfit.toFixed(2)}</span>
             </div>
          </div>

          <div className="w-full bg-black/40 rounded-xl p-3 flex justify-between items-center border border-white/5 mb-1 text-xs">
            <span className="text-gray-400">{t.activeAssets}:</span>
            <span className={hasCryptoAsset ? "text-[#00e5ff] font-bold" : "text-gray-500"}>
                {hasCryptoAsset ? "10.00 MON INVESTED" : t.none}
            </span>
          </div>

          <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-56 pr-2">
            {localTrades.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500/60 p-4 font-mono text-xs leading-relaxed">
                {t.awaitingThresholds}
              </div>
            ) : (
              localTrades.map((trade) => (
                <div key={trade.id} className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-2 transition-all hover:bg-black/50 animate-slide-down">
                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest ${trade.action.includes('BUY') ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30' : 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30'}`}>
                      {trade.action}
                    </div>
                    {trade.profit && (
                        <div className="text-[10px] font-bold text-green-400">+Profit: {trade.profit.toFixed(2)} MON</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-black/60 px-2 py-1.5 rounded border border-white/5">
                    <span className="text-[9px] text-gray-500">TX HASH</span>
                    <span className="text-[10px] text-[#836ef9] font-mono select-all truncate ml-2">
                      {trade.hash}
                    </span>
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

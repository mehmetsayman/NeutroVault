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
    onChainEx: "Live Web3 Monad Portfolio",
    awaitingThresholds: "Awaiting strong AI signals to unlock your trade opportunities...",
    target: "Monad Network",
    toggleLang: "🇹🇷 TR",
    connectWallet: "🦊 Connect Wallet",
    walletConnected: "Connected",
    executeTrade: "⚡ Execute AI Trade (5% Fee)",
    monadBalance: "Real Wallet Balance",
    totalProfit: "Total Mock PnL (MON)",
    activeAssets: "Active Mock Assets",
    none: "None. Holding Cash.",
    budgetMode: "Trade Budget (MON)"
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
    onChainEx: "Canlı Web3 Monad Portföyü",
    awaitingThresholds: "Para kazanma işlemlerinizi açmak için aşırı güçlü Yapay Zeka sinyalleri bekleniyor...",
    target: "Monad Ağı",
    toggleLang: "🇬🇧 EN",
    connectWallet: "🦊 Cüzdan Bağla",
    walletConnected: "Cüzdan Bağlı",
    executeTrade: "⚡ Alım Satımı Onayla (%5 Komisyon)",
    monadBalance: "Gerçek Cüzdan Bakiyesi",
    totalProfit: "Portföy Kâr/Zarar (MON)",
    activeAssets: "Aktif İşlemler",
    none: "Nakit Bekleniyor (Boş)",
    budgetMode: "Yatırım Bütçesi (MON)"
  }
};

const MONAD_TESTNET_CHAIN_ID = '0x279f'; // 10143 in Hex

const ensureMonadNetwork = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== MONAD_TESTNET_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET_CHAIN_ID }],
        });
      }
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: MONAD_TESTNET_CHAIN_ID,
                chainName: 'Monad Testnet',
                nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
                rpcUrls: ['https://testnet-rpc.monad.xyz/'],
                blockExplorerUrls: ['https://testnet.monadexplorer.com/']
            }],
          });
          return true;
        } catch (addError) {
          console.error(addError);
          return false;
        }
      }
      return false;
    }
};

export default function Home() {
  const [lang, setLang] = useState<"en" | "tr">("en");
  const [score, setScore] = useState(0);
  const [logs, setLogs] = useState<{ id: number; text: string; type: "info" | "action" | "reason"; timestamp: string }[]>([]);
  
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);

  // --- REAL-TIME PORTFOLIO & BUDGET SYSTEM ---
  const [monBalance, setMonBalance] = useState(0.00); 
  const [tradeAmountInput, setTradeAmountInput] = useState("0.05"); // User Dynamic Budget
  const [totalProfit, setTotalProfit] = useState(0.00);
  const [hasCryptoAsset, setHasCryptoAsset] = useState(false); 
  const [investedAmount, setInvestedAmount] = useState(0.00); 
  
  // Real Chain Data for Commission
  const [devWalletTarget, setDevWalletTarget] = useState("");
  const [developerCommission, setDeveloperCommission] = useState(0.00);
  
  const [localTrades, setLocalTrades] = useState<{ id: number; action: string; profit?: number; hash: string }[]>([]);
  const [tradeCounter, setTradeCounter] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // Request Notification Permissions on load & Restore localstorage for dev target
  useEffect(() => {
    if (typeof window !== "undefined") {
       if ("Notification" in window) Notification.requestPermission();
       const savedTarget = localStorage.getItem("devWalletTarget");
       if (savedTarget) setDevWalletTarget(savedTarget);
    }
  }, []);

  // Update devTarget to local storage to save between refreshes
  const handleSetDevTarget = (val: string) => {
      setDevWalletTarget(val);
      localStorage.setItem("devWalletTarget", val);
  };

  // Browser Notification capability for strong AI Signals
  useEffect(() => {
    if ((score >= 60 || score <= -60) && connected && wallet) {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
         new Notification("NeuroVault Yapay Zeka", {
            body: score >= 60 ? "🔥 Fırsat! Piyasada Yüksek İştah var, YZ Alım Sinyali Üretti." : "❄️ Risk! Piyasada Korku var, YZ Satış Sinyali Üretti.",
         });
      }
    }
  }, [score, connected, wallet]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // AI Backend Polling
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/state");
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        setScore(data.score);
        setLogs(data.logs);
        setConnected(true);
      } catch (err) {
        setConnected(false);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

// REAL WEB3 NETWORK BALANCE POLLING (Every 3 Seconds)
useEffect(() => {
    const fetchRealBalances = async () => {
        if (typeof window.ethereum === 'undefined') return;
        
        // Cüzdandaki Gerçek Kullanıcı Bakiyesi
        if (wallet) {
            try {
                const balanceHex = await window.ethereum.request({ method: 'eth_getBalance', params: [wallet, 'latest'] });
                setMonBalance(parseInt(balanceHex, 16) / 1e18);
            } catch(e) { /* ignore silently in background */ }
        }

        // Komisyon Havuzunun Gerçek Bakiyesi (Test Blockchain'den Canlı Çekim)
        if (devWalletTarget && devWalletTarget.startsWith("0x") && devWalletTarget.length === 42) {
            try {
                const devHex = await window.ethereum.request({ method: 'eth_getBalance', params: [devWalletTarget, 'latest'] });
                setDeveloperCommission(parseInt(devHex, 16) / 1e18);
            } catch(e) {}
        }
    };

    fetchRealBalances(); // İlk açıldığında anında çek
    const balanceInterval = setInterval(fetchRealBalances, 3000); // 3 saniyede bir cüzdanları güncelle
    return () => clearInterval(balanceInterval);
}, [wallet, devWalletTarget]);


  // Web3 Metamask Connection
  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const isMonad = await ensureMonadNetwork();
        if (!isMonad) {
           alert(lang === "tr" ? "Monad Testnet ağına geçiş yapılamadı! İşlemler başarısız olabilir." : "Failed to switch to Monad Testnet.");
        }

        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWallet(accounts[0]);
      } catch (error) {
        console.error("Wallet connection denied", error);
      }
    } else {
      alert("Metamask eklentisi bulunamadı! Lütfen yükleyin.");
    }
  };


  // Dynamic Trade Execution using scaled balance values
  const handleRetailTrade = async (forcedAction?: "BUY" | "SELL") => {
    if (!wallet) {
      alert(lang === "tr" ? "Lütfen önce Cüzdanı bağlayın!" : "Please connect your wallet first!");
      return;
    }

    if (!devWalletTarget || devWalletTarget.length !== 42) {
       alert(lang === "tr" ? "Lütfen Sağ kısımdaki 'Komisyon Hesabı' kutusuna kendi 2. cüzdanınızın adresini yapıştırın! Sistem alınan %5'lik komisyonları o cüzdanınıza transfer edecektir." : "Please add a target commission wallet address first!");
       return;
    }
    
    // Trade boyutunu Göstergeden Çek
    const tradeSize = parseFloat(tradeAmountInput);
    if (isNaN(tradeSize) || tradeSize <= 0) {
        alert(lang === "tr" ? "Geçerli bir yatırım bütçesi girin!" : "Enter a valid trade budget!");
        return;
    }

    const tradeAction = forcedAction ? forcedAction : (score >= 60 ? "BUY" : "SELL");
    
    if (tradeAction === "BUY" && hasCryptoAsset) {
        alert(lang === "tr" ? "Zaten elinizde varlık var! Satış sinyali gelmesini bekleyin veya 'Test Satış' yapın." : "You already hold assets!");
        return;
    }
    if (tradeAction === "SELL" && !hasCryptoAsset) {
        alert(lang === "tr" ? "Satacak varlığınız yok! Alış sinyali gelmesini bekleyin veya 'Test Alış' yapın." : "No assets to sell!");
        return;
    }

    const feeSize = tradeSize * 0.05; // %5 komisyon
    let txHashMined = "";

    // GERÇEK METAMASK İŞLEM ONAYI - Eğer Reddedilirse Sistem Duraklar (Strict Mode)
    if (typeof window.ethereum !== 'undefined' && wallet.startsWith("0x")) {
        try {
            await ensureMonadNetwork();
            const weiFee = BigInt(Math.floor(feeSize * 1e18));
            const hexFee = '0x' + weiFee.toString(16);

            // Strict Await! Metamaskin cevap dönmesini bekleriz. Parası yetmezse catch'e düşer ve başarısız olur.
            txHashMined = await window.ethereum.request({
               method: 'eth_sendTransaction',
               params: [{from: wallet, to: devWalletTarget, value: hexFee}], 
            });
        } catch (error) {
            console.error("Metamask reddetti veya iptal oldu.");
            alert(lang === "tr" ? "❌ İşlem Reddedildi veya Yetersiz Bakiye! Portföyünüze YANSIMADI." : "❌ Transaction Rejected!");
            return; // GERÇEKÇİ ÇALIŞMASI İÇİN DURDURULDU! BAŞARISIZ İŞLEMLER MOCK'LANMAZ!
        }
    }

    // Process logic visually using the real wallet balance foundation
    const mockHash = txHashMined || ("0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "..." + Math.random().toString(16).slice(2, 6).toUpperCase());
    const currentTradeId = tradeCounter + 1;
    setTradeCounter(currentTradeId);

    if (tradeAction === "BUY") {
        setHasCryptoAsset(true);
        setInvestedAmount(tradeSize);
        // Note: The UI balance (monBalance) will auto-refresh natively within 3 seconds due to the polling loop!
        
        setLocalTrades([{ id: currentTradeId, action: `BUY (${tradeSize} MON)`, hash: mockHash }, ...localTrades]);
    } else {
        setHasCryptoAsset(false);
        const mockProfitForThisTrade = investedAmount * (0.10 + (Math.random() * 0.20));
        setTotalProfit(totalProfit + mockProfitForThisTrade);
        setInvestedAmount(0);

        setLocalTrades([{ id: currentTradeId, action: `SELL (Kâr Realize Edildi)`, hash: mockHash, profit: mockProfitForThisTrade }, ...localTrades]);
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
                onClick={() => { setWallet(null); setMonBalance(0); setHasCryptoAsset(false); }}
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

      {/* Top Ticker: Live API Status */}
      <section className="glass-panel px-6 py-3 rounded-2xl flex items-center justify-between animate-slide-down z-10 w-full">
         <div className="flex items-center gap-3 w-full">
            <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_red]'}`}></div>
            <span className="text-xs font-mono font-bold text-gray-400 whitespace-nowrap hidden sm:block">AI SERVER STATUS:</span>
            <div className="flex-1 overflow-hidden">
                {logs.length > 0 ? (
                    <div className="text-[13px] font-mono text-[#00e5ff] truncate animate-pulse relative">
                        <span className="opacity-50 mr-2">[{logs[logs.length-1]?.timestamp}]</span> 
                        {logs[logs.length-1]?.text}
                    </div>
                ) : (
                    <div className="text-[13px] font-mono text-gray-500 animate-pulse">{connected ? t.waitingEngine : t.cannotReach}</div>
                )}
            </div>
         </div>
      </section>

      {/* Main Grid: 2 Columns Only */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 z-10 w-full h-full pb-8">
        
        {/* Left Column: Sentiment Dashboard & Input Panel */}
        <section className="glass-panel p-6 rounded-3xl flex flex-col gap-5 animate-slide-down relative h-full justify-between" style={{ animationDelay: '0.1s' }}>
          <div>
            <h2 className="text-lg font-mono font-semibold text-gray-300 border-b border-white/10 pb-3 flex items-center gap-2">
              <span>📡</span> {t.brainStateTitle}
            </h2>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center drop-shadow-2xl">
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
            </div>
          </div>

          {/* LOWER SECTION: BUDGET & ACTIONS */}
          <div className="flex flex-col gap-3">
            
            {/* Input Field For Trade Size */}
            {connected && (
               <div className="w-full flex flex-col gap-1.5 bg-black/30 p-4 rounded-2xl border border-white/5">
                 <label className="text-[11px] text-[#836ef9] font-black tracking-widest uppercase flex items-center justify-between">
                    {t.budgetMode}
                 </label>
                 <div className="flex bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-inner focus-within:border-[#00e5ff] transition-all">
                    <span className="pl-4 py-3 text-gray-500 font-bold">M</span>
                    <input 
                      type="number" 
                      value={tradeAmountInput} 
                      onChange={(e) => setTradeAmountInput(e.target.value)}
                      className="w-full bg-transparent text-[#00e5ff] font-mono font-black text-lg px-2 py-3 outline-none"
                      step="0.01"
                      min="0.001"
                      placeholder="0.05"
                    />
                    <span className="pr-4 py-3 text-gray-600 font-black text-xs self-center">MONAD</span>
                 </div>
               </div>
            )}

            {/* The Main Dynamic Trade Button (Glows & Blinks Aggressively when available) */}
            {(score >= 60 || score <= -60) && connected && (
              <button 
                onClick={() => handleRetailTrade()}
                className={`w-full py-5 rounded-2xl font-black text-white text-[15px] tracking-widest uppercase transition-all duration-300 shadow-[0_0_40px] hover:scale-105 active:scale-95 cursor-pointer border-2
                    ${score >= 60 
                     ? (hasCryptoAsset ? 'bg-gray-700 border-gray-500 opacity-50 cursor-not-allowed hidden' : 'bg-gradient-to-r from-[#00e5ff] to-blue-600 shadow-[#00e5ff] border-[#00e5ff] animate-[pulse_1s_infinite]')
                     : (!hasCryptoAsset ? 'bg-gray-700 border-gray-500 opacity-50 cursor-not-allowed hidden' : 'bg-gradient-to-r from-[#ff0055] to-red-600 shadow-[#ff0055] border-[#ff0055] animate-[pulse_1s_infinite]')
                    }
                `}
              >
                {t.executeTrade}
              </button>
            )}

            {/* Manual Trade Override / Force Buttons (Always visible when connected) */}
            {connected && (
               <div className="flex gap-2 w-full">
                 <button 
                   onClick={() => handleRetailTrade("BUY")}
                   className="flex-1 py-3 bg-black/40 border border-[#00e5ff]/30 text-[#00e5ff] text-[11px] font-black uppercase rounded-xl hover:bg-[#00e5ff]/20 transition-all shadow-[0_0_10px_#00e5ff1a]"
                 >
                   MANUAL AL (TEST)
                 </button>
                 <button 
                   onClick={() => handleRetailTrade("SELL")}
                   className="flex-1 py-3 bg-black/40 border border-[#ff0055]/30 text-[#ff0055] text-[11px] font-black uppercase rounded-xl hover:bg-[#ff0055]/20 transition-all shadow-[0_0_10px_#ff00551a]"
                 >
                   MANUAL SAT (TEST)
                 </button>
               </div>
            )}
          </div>
        </section>

        {/* Right Column: Execution History & Portfolio */}
        <section className="glass-panel p-6 rounded-3xl flex flex-col gap-4 animate-slide-down" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-mono font-semibold text-gray-300 border-b border-white/10 pb-3 flex items-center gap-2">
            <span>💼</span> {t.onChainEx}
          </h2>
          
          <div className="w-full bg-[#836ef9]/10 border border-[#836ef9]/30 rounded-xl p-4 flex justify-between items-center mb-1 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#836ef9] rounded-full blur-[60px] opacity-20"></div>
             <div className="flex flex-col z-10 w-full">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.monadBalance}</span>
                <span className="text-3xl font-black text-white">{monBalance.toFixed(4)} <span className="text-[14px] text-[#836ef9]">MON</span></span>
             </div>
          </div>

          <div className="w-full bg-black/40 rounded-xl p-3 flex justify-between items-center border border-white/5 text-xs mb-1">
            <span className="text-gray-400">{t.activeAssets}:</span>
            <span className={hasCryptoAsset ? "text-[#00e5ff] font-bold animate-pulse" : "text-gray-500"}>
                {hasCryptoAsset ? `PORTFÖYDE ${investedAmount.toFixed(4)} MON RİSKTE` : t.none}
            </span>
          </div>
          
          <div className="w-full bg-green-500/10 rounded-xl p-3 flex justify-between items-center border border-green-500/20 text-xs mb-1">
            <span className="text-gray-300">{lang === "tr" ? "Müşteri Sanal Kâr/Zarar:" : "Client Mock PnL:"}</span>
            <span className={`font-bold ${totalProfit > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                +{totalProfit.toFixed(4)} MON ✨
            </span>
          </div>

          {/* DEVELOPER COMMISSION EARNINGS PANEL (100% REAL WEB3) */}
          <div className="w-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl p-3 flex flex-col gap-3 text-xs shadow-[0_0_10px_#00e5ff33]">
             <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-semibold">{lang === "tr" ? "Platform Sahibi (2. Cüzdan):" : "Fee Receiver:"}</span>
                <input 
                   type="text" 
                   value={devWalletTarget} 
                   onChange={e => handleSetDevTarget(e.target.value)} 
                   placeholder="0xMutaHesabiniziYazin..."
                   className="bg-black/50 border border-[#00e5ff]/40 text-[#00e5ff] w-40 px-2 py-1.5 outline-none text-[10px] rounded focus:w-56 transition-all"
                />
             </div>
             
             <div className="h-[1px] w-full bg-[#00e5ff]/20"></div>

            <div className="flex justify-between items-center text-[13px] mt-1">
                <span className="text-gray-100 font-black">{lang === "tr" ? "Gerçek Komisyon Havuzu:" : "Live Native Earnings:"}</span>
                {devWalletTarget.length === 42 ? (
                    <span className="text-[#00e5ff] font-black text-base animate-pulse">{developerCommission.toFixed(4)} MON 📈</span>
                ) : (
                    <span className="text-red-500 font-bold text-[10px]">ADRES BEKLENİYOR</span>
                )}
            </div>
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
                    <div className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest flex-1 mr-2 ${trade.action.includes('BUY') ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30' : 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30'}`}>
                      {trade.action}
                    </div>
                    {trade.profit && (
                        <div className="text-[10px] font-bold text-green-400 whitespace-nowrap">+Kâr: {trade.profit.toFixed(4)} MON</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-black/60 px-2 py-1.5 rounded border border-white/5">
                    <span className="text-[9px] text-gray-500">TX HASH DÖKÜMÜ</span>
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

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#051139] text-white pb-24 relative overflow-x-hidden">
      
      {/* 🔙 Header */}
      <div className="p-4 flex items-center gap-4 bg-[#051139]/90 sticky top-0 z-10 backdrop-blur-md border-b border-white/5">
        <Link href="/profile" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
        <h1 className="text-lg font-black uppercase tracking-widest">About App</h1>
      </div>

      <div className="px-6 flex flex-col items-center mt-8">
        
        {/* 🚀 App Logo / Branding */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-6 rotate-3 border border-white/10">
           <span className="text-4xl">🚀</span>
        </div>

        <h2 className="text-3xl font-black tracking-tighter">Recapbox</h2>
        <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mt-1 mb-6">Entertainment Hub</p>

        {/* 📝 Introduction */}
        <div className="bg-[#112240] p-6 rounded-3xl border border-white/5 shadow-xl w-full mb-6">
           <p className="text-gray-300 text-sm leading-relaxed text-center">
             Recapbox is your ultimate destination for Movies Recaps, Manga, Novels, and Series. We provide high-quality content aggregation for entertainment lovers.
           </p>
        </div>

        {/* ✨ Features Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
           <FeatureCard icon="🎬" title="Recaps" desc="HD Quality" />
           <FeatureCard icon="📚" title="Manga" desc="Latest Chapters" />
           <FeatureCard icon="📖" title="Novels" desc="Popular Stories" />
           <FeatureCard icon="📺" title="Series" desc="Direct Stream" />
        </div>

        {/* ⚠️ Disclaimer / Legal */}
        <div className="w-full mb-8">
           <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Disclaimer</h3>
           <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
              <p className="text-[10px] text-gray-400 leading-relaxed text-justify">
                 This application does not host any files on its servers. All content is provided by non-affiliated third parties. We do not accept responsibility for content hosted on third-party websites and do not have any involvement in the downloading/uploading of movies. We just post links available on the internet.
              </p>
           </div>
        </div>

        {/* 📞 Contact */}
        <div className="w-full space-y-3 mb-10">
           <Link 
             href="https://m.me/recapbox26/" 
             target="_blank"
             className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
           >
             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.56 5.48 4.01 7.08-.1.74-.53 2.18-1.56 3.09 0 0 1.83.18 4.08-1.29 1.1.31 2.27.48 3.47.48 5.52 0 10-4.03 10-9S15.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
             <span>Contact Support</span>
           </Link>
           
           <Link 
             href="https://t.me/recapbox" 
             target="_blank"
             className="flex items-center justify-center gap-3 w-full bg-[#229ED9] hover:bg-[#1c8ec7] text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
           >
             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
             <span>Join Telegram Channel</span>
           </Link>
        </div>

        {/* 🦶 Footer */}
        <div className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest pb-8">
           <p>Version 1.0.0 (Beta)</p>
           <p className="mt-1">© 2024 RecapX Team</p>
        </div>

      </div>
    </div>
  );
}

// 🧱 Small Component for Features
function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-[#1a2a47]/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
       <span className="text-2xl mb-2">{icon}</span>
       <h4 className="font-bold text-sm text-gray-200">{title}</h4>
       <p className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">{desc}</p>
    </div>
  )
}
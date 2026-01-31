import { pb } from "@/lib/pocketbase";
import { getFreshUser } from "@/lib/get-user"; 
import Link from "next/link";
import MangaImageViewer from "../../../../components/MangaImageViewer"; // 👈 အသစ် import လုပ်မယ်

export const dynamic = "force-dynamic";

export default async function MangaReader({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;

  // 🛡️ ၁။ User Status
  const user = await getFreshUser();
  const isVipUser = user?.is_vip === true;

  // ၂။ Chapter Data
  const chapter = await pb.collection('manga_chapters').getOne(chapterId, {
    requestKey: null,
    // @ts-ignore
    "t": new Date().getTime(),
  });

  // 🔐 ၃။ VIP Paywall
  if (chapter.is_vip && !isVipUser) {
    return (
      <main className="min-h-screen bg-[#051139] flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-[#0a192f] rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <span className="text-4xl animate-pulse">🔐</span>
          </div>
          <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest">VIP Only</h2>
          <p className="text-gray-400 text-xs mt-4 mb-8 font-bold uppercase tracking-tighter">
              ကိုကိုရေ... VIP Member ဖြစ်မှ <br/> ဒီအခန်းကို ဖတ်ရှုလို့ရပါမယ်ရှင့်
          </p>
          <Link href="/vip" className="block w-full py-4 bg-yellow-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
            Upgrade Now
          </Link>
          <Link href={`/manga/${id}`} className="block mt-6 text-gray-500 text-[10px] font-black uppercase">
            Back to Details
          </Link>
        </div>
      </main>
    );
  }

  // ✅ ၄။ Reader UI Data Preparation
  const allChapters = await pb.collection('manga_chapters').getFullList({ 
    filter: `manga_id = "${id}"`, 
    sort: 'title', 
    requestKey: null 
  });
  
  // Sorting Logic (1, 10, 2 ပြဿနာရှင်းဖို့)
  allChapters.sort((a, b) => {
     return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
  });

  const currentIndex = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = allChapters[currentIndex - 1];
  const nextChapter = allChapters[currentIndex + 1];
  const pages: string[] = chapter.pages || [];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center">
      
      {/* Navbar */}
      <div className="w-full bg-[#0f0f0f]/95 p-4 sticky top-0 z-50 border-b border-gray-800 flex justify-between items-center px-6 shadow-xl backdrop-blur-md">
        <Link href={`/manga/${id}`} className="text-gray-400 font-bold text-xs uppercase hover:text-white transition-colors">← Back</Link>
        <h1 className="text-[10px] font-black truncate max-w-[150px] text-yellow-500 uppercase tracking-widest">{chapter.title}</h1>
        <div className="text-[10px] bg-white/10 px-2 py-1 rounded font-black text-white/50">{currentIndex + 1} / {allChapters.length}</div>
      </div>

      {/* 🔥 NEW: MangaImageViewer (ပုံပြမယ်၊ Scroll မှတ်မယ်၊ Auto Scroll လုပ်မယ်) */}
      <MangaImageViewer 
        mangaId={id}
        chapterId={chapterId}
        pages={pages}
        collectionId={chapter.collectionId}
        recordId={chapter.id}
      />

      {/* Bottom Nav */}
      <div className="w-full sticky bottom-0 bg-[#0f0f0f]/95 p-4 flex gap-4 z-50 border-t border-gray-800 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <Link href={prevChapter ? `/manga/${id}/read/${prevChapter.id}` : "#"} className={`flex-1 py-4 bg-white/5 rounded-2xl text-center text-xs font-black uppercase border border-white/5 ${!prevChapter && 'opacity-20 pointer-events-none'}`}>← Prev</Link>
        
        <Link 
          href={nextChapter ? `/manga/${id}/read/${nextChapter.id}` : "#"} 
          className={`flex-1 py-4 rounded-2xl text-center text-xs font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all
            ${!nextChapter ? 'opacity-20 pointer-events-none' : (nextChapter.is_vip && !isVipUser ? 'bg-yellow-600' : 'bg-blue-600')}
          `}
        >
          Next {nextChapter?.is_vip && !isVipUser && "👑"} →
        </Link>
      </div>
    </main>
  );
}
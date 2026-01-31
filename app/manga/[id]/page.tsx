import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import { getFreshUser } from "@/lib/get-user"; // 👈 Helper ကိုပြန်သုံးမယ်
import Link from "next/link";
import StarRating from "../../components/StarRating";

export const dynamic = "force-dynamic";

export default async function MangaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 🛡️ ၁။ User Status (Helper နဲ့ယူမှ သေချာမယ်)
  const user = await getFreshUser();
  const userId = user?.id;
  const isVipUser = user?.is_vip === true;

  // ၂။ Data Fetching
  let manga: any = {};
  let chapters: any = { items: [] };
  let averageRating = 0.0;
  let totalReviews = 0;
  let lastReadChapterId = null;

  try {
    // A. Manga Detail & Ratings
    manga = await pb.collection('manga').getOne(id);
    const ratingsResult = await pb.collection('ratings').getFullList({
      filter: `manga = "${id}"`,
      requestKey: null,
      $autoCancel: false,
    });

    if (ratingsResult.length > 0) {
      const sum = ratingsResult.reduce((acc, r) => acc + (r.rating || 0), 0);
      averageRating = sum / ratingsResult.length;
      totalReviews = ratingsResult.length;
    }

    // B. History (User ရှိမှ ရှာမယ်)
    if (userId) {
        try {
            const lastHistory = await pb.collection('reading_history').getFirstListItem(
                `user = "${userId}" && manga = "${id}"`, 
                { requestKey: null }
            );
            lastReadChapterId = lastHistory.last_chapter;
        } catch(e) {
            // History မရှိရင် ကျော်မယ်
        } 
    }

    // C. Chapters List (အများကြီးဆွဲမယ်)
    chapters = await pb.collection('manga_chapters').getList(1, 1000, { 
      filter: `manga_id = "${id}"`, 
    });

    // D. Sorting (နာမည်အတိုင်း အငယ် -> အကြီး စီမယ်)
    if (chapters.items.length > 0) {
      chapters.items.sort((a: any, b: any) => {
        return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
      });
    }

  } catch (e) {
    console.error("❌ Data Fetch Error:", e);
  }

  // 🔥 CALCULATE READ STATUS
  // နောက်ဆုံးဖတ်ထားတဲ့ Chapter ရဲ့ နေရာ (Index) ကို ရှာမယ်
  const lastReadIndex = chapters.items.findIndex((c: any) => c.id === lastReadChapterId);

  const imageUrl = manga.image ? `${R2_DOMAIN}/${manga.collectionId}/${manga.id}/${manga.image}` : "";

  return (
    <div className="min-h-screen bg-[#051139] text-white pb-24 relative">
      {/* Header Banner */}
      <div className="relative h-[40vh] w-full">
        {imageUrl && <img src={imageUrl} className="w-full h-full object-cover opacity-40" alt="Banner" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#051139] to-transparent" />
        <Link href="/manga" className="absolute top-6 left-4 p-2 bg-black/40 rounded-full border border-white/10 z-20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5}/></svg>
        </Link>
      </div>

      <div className="px-4 -mt-20 relative z-10">
        <div className="bg-[#0a192f]/90 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-black leading-tight">{manga.title || "Loading..."}</h1>
          <p className="text-blue-400 text-sm font-bold mt-1">Author: {manga.author || "Giddo"}</p>
          
          <div className="flex items-center gap-4 mt-6">
            <span className="text-4xl font-black text-yellow-500">{averageRating.toFixed(1)}</span>
            <div>
              <div className="flex text-yellow-500 text-xs">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-600"}>★</span>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wide">
                {totalReviews} Reviews
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
             <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Rate this Manga</p>
             <StarRating collectionName="manga" itemId={id} />
          </div>

          <div className="mt-6">
            <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest">Description</h2>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed">{manga.description || "No description available."}</p>
          </div>
        </div>

        {/* 📖 Chapters List */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-lg font-black">Chapters List</h3>
             <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">{chapters.items.length} Chapters</span>
          </div>

          <div className="space-y-2">
            {chapters.items.map((chapter: any, index: number) => {
              const isLocked = chapter.is_vip && !isVipUser;
              
              // 🔥 LOGIC:
              // lastReadIndex က -1 မဟုတ်ရင် (ဖတ်ဖူးရင်)၊ လက်ရှိ index က အဲ့ဒီ lastReadIndex ထက် ငယ်သမျှ အကုန်လုံးကို Read လို့သတ်မှတ်မယ်
              const isLastRead = chapter.id === lastReadChapterId;
              const isRead = lastReadIndex !== -1 && index < lastReadIndex;

              return (
                <Link 
                  key={chapter.id} 
                  href={`/manga/${id}/read/${chapter.id}`}
                  className={`
                    group flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]
                    
                    ${isLastRead 
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' // 🔵 Resume Highlight
                        : isRead 
                            ? 'bg-black/20 border-white/5 opacity-50 grayscale' // 🌑 Read (Dimmed)
                            : isLocked 
                                ? 'bg-yellow-500/5 border-yellow-500/20' // 🟡 Locked
                                : 'bg-[#112240] border-white/5 hover:bg-white/10' // ⚪ Unread (Normal)
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon Logic */}
                    {isLastRead ? (
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6] flex-shrink-0"></div>
                    ) : isRead ? (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : null}

                    <span className={`text-sm font-bold truncate ${chapter.is_vip ? 'text-yellow-500' : isRead ? 'text-gray-400' : 'text-gray-200'}`}>
                        {chapter.title}
                    </span>
                    
                    {chapter.is_vip && <span className="text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black italic">VIP</span>}
                    {isLastRead && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Resume</span>}
                  </div>

                  {/* Right Side Status */}
                  <div className="flex items-center gap-2 text-xs flex-shrink-0 pl-2">
                    {isLocked ? (
                        <span className="opacity-50 text-xl">🔐</span>
                    ) : isLastRead ? (
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : isRead ? (
                        <span className="text-[10px] font-bold text-green-500/50 uppercase tracking-widest">Read</span>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-widest transition-colors">Start</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import { getFreshUser } from "@/lib/get-user"; 
import Link from "next/link";
import StarRating from "../../components/StarRating";

export const dynamic = "force-dynamic";

export default async function NovelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getFreshUser();
  const userId = user?.id;

  let novel: any = {};
  let chapters: any = { items: [] };
  let averageRating = 0.0;
  let totalReviews = 0;
  let lastReadChapterId = null;

  try {
    novel = await pb.collection('novels').getOne(id);
    
    const ratingsResult = await pb.collection('ratings').getFullList({
      filter: `novel = "${id}"`,
      requestKey: null,
      $autoCancel: false,
    });

    if (ratingsResult.length > 0) {
      const sum = ratingsResult.reduce((acc, r) => acc + (r.rating || 0), 0);
      averageRating = sum / ratingsResult.length;
      totalReviews = ratingsResult.length;
    }

    // 🔥 C. Updated History Logic: Duplicate ဖြစ်နေရင်တောင် အသစ်ဆုံးကို ယူမယ်
    if (userId) {
        try {
            const historyList = await pb.collection('reading_history').getList(1, 1, {
                filter: `user = "${userId}" && novel = "${id}" && type = "novel"`,
                sort: '-updated', // 👈 အသစ်ဆုံး ပြင်ထားတဲ့ တစ်ခုကိုပဲ ယူမယ်
                requestKey: null
            });

            if (historyList.items.length > 0) {
                lastReadChapterId = historyList.items[0].read_chapter;
            }
        } catch(e) {
          console.log("History Fetch Error:", e);
        }
    }

    chapters = await pb.collection('novel_chapters').getList(1, 500, {
      filter: `novel_id = "${id}"`, 
    });

    if (chapters.items.length > 0) {
      chapters.items.sort((a: any, b: any) => {
        return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
      });
    }

  } catch (e) {
    console.error("❌ Fetch Error:", e);
  }

  // 🔥 CALCULATE READ STATUS
  const lastReadIndex = chapters.items.findIndex((c: any) => c.title === lastReadChapterId);
  const imageUrl = `${R2_DOMAIN}/${novel.collectionId}/${novel.id}/${novel.image}`;

  return (
    <div className="min-h-screen bg-[#051139] text-white pb-24 relative overflow-x-hidden">
      
      {/* 🖼️ Header Banner */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img src={imageUrl} className="w-full h-full object-cover object-top opacity-50" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#051139] via-[#051139]/30 to-transparent" />
        
        <Link href="/novels" className="absolute top-6 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>

      <div className="px-4 -mt-24 relative z-10 max-w-4xl mx-auto">
        {/* 📦 Info Card */}
        <div className="bg-[#0a192f]/80 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-black leading-tight tracking-tight">{novel.title}</h1>
          <p className="text-blue-400 text-sm mt-2 font-bold uppercase tracking-widest">Author: {novel.author || "Unknown"}</p>

          <div className="flex items-center gap-4 mt-6">
            <span className="text-4xl font-black text-yellow-500">{averageRating.toFixed(1)}</span>
            <div>
              <div className="flex text-yellow-500 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-600 text-opacity-50"}>★</span>
                  ))}
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wide">{totalReviews} Reviews</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
             <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Rate this Novel</p>
             <StarRating collectionName="novel" itemId={id} />
          </div>

          <div className="mt-6">
            <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest">Description</h2>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">{novel.description || "No description available."}</p>
          </div>
        </div>

        {/* 📖 Chapters List */}
        <div className="mt-10 space-y-4">
          <h3 className="text-lg font-black px-2 flex items-center justify-between">
            <span>📖 Chapters List</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">{chapters.items.length} Chapters</span>
          </h3>
          
          <div className="space-y-2">
            {chapters.items.length > 0 ? (
              chapters.items.map((chap: any, index: number) => {
                const isLastRead = chap.title === lastReadChapterId;
                const isRead = lastReadIndex !== -1 && index < lastReadIndex;

                return (
                  <Link 
                    key={chap.id} 
                    href={`/novels/${id}/read/${chap.id}`}
                    className={`
                        flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] group
                        ${isLastRead 
                            ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                            : isRead 
                                ? 'bg-black/20 border-white/5 opacity-50 grayscale' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10' 
                        }
                    `}
                  >
                    <div className="flex items-center gap-3">
                       {isLastRead ? (
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                       ) : isRead ? (
                           <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                       ) : (
                           <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                       )}

                       <span className={`font-bold text-sm transition-colors ${isLastRead ? 'text-blue-400' : isRead ? 'text-gray-500' : 'text-gray-200 group-hover:text-blue-400'}`}>
                         {chap.title || "Untitled Chapter"}
                       </span>
                    </div>

                    <div className="flex items-center gap-2">
                       {isLastRead && <span className="text-[8px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Resume</span>}
                       {isRead && <span className="text-[9px] font-black text-green-500/50 uppercase">Read</span>}
                       {!isRead && !isLastRead && <span className="text-[10px] font-black text-blue-500 uppercase">Read Now</span>}
                       <svg className={`w-4 h-4 ${isLastRead ? 'text-blue-500' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3}/></svg>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="p-10 text-center text-gray-500 font-bold italic">No chapters found yet.</div>
            )}
          </div>
        </div>

        {/* 📢 Contact Author Section */}
        {novel.contact_url && novel.contact_url !== "N/A" && (
          <div className="mt-16 mb-10 p-8 rounded-[32px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="text-2xl">✍️</span>
            </div>
            <h4 className="text-lg font-black mb-2">ဖရီးတင်ထားသောစာစဉ်များ ကုန်ဆုံးသွားပါပြီ</h4>
            <p className="text-gray-400 text-xs font-medium mb-6 px-4">
              နောက်ဆက်တွဲ အပိုင်းများကို ဆက်လက်ဖတ်ရှုလိုပါက စာရေးဆရာကို တိုက်ရိုက်ဆက်သွယ် ဝယ်ယူနိုင်ပါတယ်။
            </p>
            <a 
              href={novel.contact_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              <span>စာရေးဆရာကိုဆက်သွယ်ရန်</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7-7 7M3 12h18" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
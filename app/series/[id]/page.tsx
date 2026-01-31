import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import { getFreshUser } from "@/lib/get-user"; 
import Link from "next/link";
import StarRating from "../../components/StarRating";

export const dynamic = "force-dynamic";

export default async function SeriesDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 🛡️ ၁။ User Status
  const user = await getFreshUser();
  const isVipUser = user?.is_vip === true;

  // 2. Series အချက်အလက်ယူမယ်
  const series = await pb.collection('reel_series').getOne(id);
  
  // 3. Episode တွေကို ဆွဲမယ်
  const episodes = await pb.collection('reel_episodes').getList(1, 500, { // 500 ထိ တိုးထားမယ်
    filter: `series_id = "${id}"`,
    // sort: 'episode_number', // DB sort ကို ဖြုတ်ပြီး JS sort သုံးမယ်
    requestKey: null,
  });

  // 🔥 SORTING FIX: ၁, ၁၀, ၁၁ ပြဿနာကို ဖြေရှင်းခြင်း
  if (episodes.items.length > 0) {
    episodes.items.sort((a: any, b: any) => {
      // episode_number ကို စာသားပြောင်းပြီး numeric sort လုပ်မယ်
      const valA = a.episode_number?.toString() || "";
      const valB = b.episode_number?.toString() || "";
      return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  // 🔥 4. Rating Calculation
  let averageRating = 0.0;
  let totalReviews = 0;

  try {
    const ratingsResult = await pb.collection('ratings').getFullList({
      filter: `series = "${id}"`, // Series ID နဲ့ filter
      requestKey: null,
      $autoCancel: false,
    });

    if (ratingsResult.length > 0) {
      // ⚠️ score field ကို ပေါင်းရမယ်
      const sum = ratingsResult.reduce((acc, r) => acc + (r.score || 0), 0);
      averageRating = sum / ratingsResult.length;
      totalReviews = ratingsResult.length;
    }
  } catch (e) {
    console.log("Rating Fetch Error:", e);
  }

  const imageUrl = `${R2_DOMAIN}/${series.collectionId}/${series.id}/${series.cover_image}`;

  return (
    <div className="min-h-screen bg-transparent text-white pb-24 relative overflow-x-hidden">
      
      {/* 🖼️ Header Banner */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img 
          src={imageUrl} 
          className="w-full h-full object-cover object-top opacity-50" 
          alt="Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#051139] via-[#051139]/30 to-transparent" />
        <Link href="/series" className="absolute top-6 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-20 shadow-xl hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>

      {/* 📦 Series Info Card */}
      <div className="px-4 -mt-28 relative z-10 max-w-4xl mx-auto">
        <div className="bg-[#0a192f]/80 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-2xl">
          
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-black leading-tight tracking-tight flex-1">{series.title}</h1>
            <span className="bg-blue-600/30 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-blue-500/20">
               {series.type || "Series"}
            </span>
          </div>

          {/* ⭐ Rating Section */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-4xl font-black text-yellow-500">{averageRating.toFixed(1)}</span>
            <div>
              <div className="flex text-yellow-500 gap-0.5">
                {[...Array(5)].map((_, i) => (
                   <span key={i} className={i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-600 text-opacity-50"}>
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                   </span>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">
                {totalReviews} Reviews • Full Series
              </p>
            </div>
          </div>

          {/* Rate Button */}
          <div className="mt-4 pt-4 border-t border-white/5">
             <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Rate this Series</p>
             <StarRating collectionName="series" itemId={id} />
          </div>

          <div className="mt-8">
            <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-blue-500 pl-2">Description</h2>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed font-medium line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
              {series.description || "No description available for this series."}
            </p>
          </div>
        </div>

        {/* 📺 Episodes List */}
        <div className="mt-10 space-y-4">
          <h3 className="text-lg font-black px-2 flex items-center justify-between">
            <span>📺 Episode List</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold uppercase">{episodes.items.length} Parts</span>
          </h3>
          
          <div className="space-y-2.5">
            {episodes.items.length > 0 ? (
              episodes.items.map((ep: any) => {
                const isLocked = ep.is_vip && !isVipUser;
                return (
                  <Link 
                    key={ep.id} 
                    href={isLocked ? `/series/${id}/watch/${ep.id}` : `/series/${id}/watch/${ep.id}`}
                    className={`flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 transition-all active:scale-[0.98] group
                      ${isLocked ? 'opacity-70 grayscale hover:grayscale-0' : 'hover:bg-blue-600/20 hover:border-blue-500/30'}
                    `}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm transition-colors ${isLocked ? 'text-gray-400' : 'text-gray-100 group-hover:text-blue-400'}`}>
                            Episode {ep.episode_number}
                          </span>
                          {ep.is_vip && (
                             <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${isLocked ? 'bg-yellow-500 text-black' : 'bg-yellow-500/20 text-yellow-500'}`}>
                               {isLocked ? 'LOCKED' : 'VIP'}
                             </span>
                          )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium truncate max-w-[200px] mt-0.5">{ep.title || "No Episode Title"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isLocked ? 'text-gray-500' : 'text-blue-500 group-hover:text-white'}`}>
                        {isLocked ? 'Unlock' : 'Watch'}
                      </span>
                      <div className={`p-1.5 rounded-lg transition-colors ${isLocked ? 'bg-white/5' : 'bg-blue-500/10 group-hover:bg-blue-500'}`}>
                        {isLocked ? (
                          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                          <svg className="w-4 h-4 text-blue-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-500 font-bold italic bg-white/5 rounded-3xl border border-dashed border-white/10">Coming Soon... Episodes are being uploaded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
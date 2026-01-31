"use client";

import { useEffect, useRef, useState, use } from "react";
import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SeriesReelPlayer({ params }: { params: Promise<{ id: string, episodeId: string }> }) {
  const { id, episodeId } = use(params);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // User state ထည့်မယ်
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 🛡️ ၁။ User Data & VIP Status စစ်ဆေးခြင်း (Realtime Check)
  useEffect(() => {
    const checkUser = async () => {
      if (pb.authStore.isValid && pb.authStore.model?.id) {
        try {
          // Cache Buster နဲ့ User အစစ်ကို ဆွဲမယ်
          const freshUser = await pb.collection("users").getOne(pb.authStore.model.id, {
            requestKey: null,
            // @ts-ignore
            "t": new Date().getTime() 
          });
          setUser(freshUser);
        } catch (e) { setUser(null); }
      } else {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  // ၂။ Video Data ဆွဲခြင်း
  useEffect(() => {
    const fetchData = async () => {
      const records = await pb.collection('reel_episodes').getFullList({
        filter: `series_id = "${id}"`,
        sort: 'episode_number',
        requestKey: null,
      });
      
      const currentIndex = records.findIndex(e => e.id === episodeId);
      const sortedEpisodes = [
        ...records.slice(currentIndex),
        ...records.slice(0, currentIndex)
      ];
      
      setEpisodes(sortedEpisodes);
      setLoading(false);
    };
    fetchData();
  }, [id, episodeId]);

  // ၃။ Intersection Observer (Auto Play/Pause)
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector("video") as HTMLVideoElement;
        // Video ရှိပြီး Lock မကျမှ Play မယ်
        if (video && !entry.target.classList.contains("locked-slide")) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0; // Reset time
          }
        }
      });
    }, { threshold: 0.8 });

    const items = document.querySelectorAll(".video-slide");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [episodes, loading, user]); // User ပြောင်းရင် Re-check မယ်

  if (loading) return <div className="fixed inset-0 bg-black flex items-center justify-center text-white">Loading Series...</div>;

  return (
    <main ref={containerRef} className="fixed inset-0 bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      
      {/* Back Button */}
      <Link href={`/series/${id}`} className="fixed top-6 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-90 transition-transform">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
      </Link>

      {episodes.map((ep) => {
        // 🔥 VIP Logic: Episode က VIP ဖြစ်ပြီး User က VIP မဟုတ်ရင် Lock ချမယ်
        const isLocked = ep.is_vip && (!user || !user.is_vip);

        return (
          <div 
            key={ep.id} 
            className={`video-slide h-full w-full snap-start relative flex items-center justify-center bg-black ${isLocked ? 'locked-slide' : ''}`}
          >
            {/* 🔐 Paywall UI (Locked ဖြစ်ရင် ဒါပြမယ်) */}
            {isLocked ? (
              <div className="absolute inset-0 z-20 bg-[#051139]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                 <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                    <span className="text-5xl animate-pulse">🔐</span>
                 </div>
                 <h2 className="text-2xl font-black text-white uppercase mb-2">VIP Episode</h2>
                 <p className="text-gray-400 text-sm font-medium mb-8 max-w-xs">
                    ကိုကိုရေ... ဒီအပိုင်းကိုကြည့်ဖို့ <br/> VIP Member ဝင်ထားဖို့ လိုပါတယ်ရှင့်
                 </p>
                 <Link href="/vip" className="w-full max-w-xs py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl text-black font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    Unlock Now
                 </Link>
                 <button onClick={() => router.back()} className="mt-6 text-gray-500 text-xs font-bold uppercase hover:text-white transition-colors">
                    Go Back
                 </button>
              </div>
            ) : (
              /* ✅ Unlocked Video Player */
              <video 
                src={`${R2_DOMAIN}/${ep.collectionId}/${ep.id}/${ep.video_file}`} 
                className="w-full h-full object-contain" 
                loop 
                playsInline 
                controls 
                poster={`${R2_DOMAIN}/${ep.collectionId}/${ep.id}/${ep.thumbnail}`} // Optional: Thumbnail ရှိရင်ထည့်
              />
            )}

            {/* Info Overlay (Lock မကျမှ ပြမယ်) */}
            {!isLocked && (
              <div className="absolute bottom-24 left-4 z-10 pointer-events-none">
                <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-sm mb-2 inline-block uppercase tracking-wider">
                  Episode {ep.episode_number}
                </span>
                <h3 className="text-white font-bold text-lg drop-shadow-md leading-tight max-w-[80%]">{ep.title}</h3>
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}
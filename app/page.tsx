"use client";

import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoginPage from "./login/page"; // ✅ LoginPage ကို import ခေါ်မယ်

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 🔍 အကောင့်ဝင်ထားလား အရင်စစ်မယ်
    setIsLoggedIn(pb.authStore.isValid);
    setAuthLoading(false);

    // Auth status ပြောင်းရင် ချက်ချင်းသိအောင်
    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) return (
    <div className="min-h-screen bg-[#051139] flex items-center justify-center text-blue-500">
      Loading Auth...
    </div>
  );

  // 🔐 အကောင့်မဝင်ရသေးရင် Login Screen ကိုပဲ ပြမယ်
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // ✅ အကောင့်ဝင်ထားရင် Video Page (HomeContent) ကို ပြမယ်
  return <HomeContent />;
}

// 📺 မူရင်း Video List ကုဒ်တွေကို ဒီထဲမှာပဲ ဆက်ထားပေးတယ်နော်
function HomeContent() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const records = await pb.collection('videos').getFullList({
          sort: '-published_at',
          expand: 'channel',
          requestKey: null, 
        });

        const formattedVideos = records.map((record: any) => ({
          id: record.id,
          title: record.title || "No Title",
          youtubeId: record.video_id || record.url || "",
          channelName: record.expand?.channel?.name || record.channel_name || "Recap Entertainment",
        }));

        setVideos(formattedVideos);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#051139] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#051139] text-white pb-24">
      <div className="p-4 space-y-8 mt-2">
        {videos.length > 0 ? videos.map((video) => {
          if (!video.youtubeId) return null;
          const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

          return (
            <div key={video.id} className="block space-y-3">
              <Link href={`/channel/${encodeURIComponent(video.channelName)}`} className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-blue-400/90">
                  <div className="p-1 bg-blue-500/20 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2}/></svg>
                  </div>
                  <span className="text-sm font-semibold">{video.channelName}</span>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={2}/></svg>
              </Link>

              <Link href={`/watch/${video.id}`} className="block group">
                <div className="bg-[#0a192f] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                  <div className="relative aspect-video">
                    <img src={thumbnailUrl} className="w-full h-full object-cover" alt={video.title} />
                  </div>
                  <div className="p-4">
                    <h3 className="text-[15px] font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </div>
          );
        }) : (
          <div className="text-center py-20 text-gray-500">
            ဗီဒီယိုတွေ ရှိမနေဘူးဖြစ်နေတယ်... <br/>
            <span className="text-[10px] uppercase">Check Connection & Database</span>
          </div>
        )}
      </div>
    </main>
  );
}
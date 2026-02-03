"use client";

import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { useEffect, useState, use } from "react";

export default function ChannelPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const [activeTab, setActiveTab] = useState("videos");
  const [channelData, setChannelData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // ၁။ ချန်နယ်ဒေတာယူမယ် -့ database ထဲက field နာမည်တွေအတိုင်း ယူမယ်
        const channel = await pb.collection('channels').getFirstListItem(`name="${decodedName}"`, {
          requestKey: null,
        });
        
        if (channel) {
          // 🛠️ Field နာမည်အမှန်တွေဖြစ်တဲ့ logo_url နဲ့ banner_url ကို သုံးလိုက်ပြီနော်
          setChannelData({
            ...channel,
            logo: channel.logo_url,   // PocketBase က link တိုက်ရိုက်သိမ်းထားတာမို့လို့ ဒီအတိုင်းသုံးလို့ရတယ်
            banner: channel.banner_url
          });

          // ၂။ ဗီဒီယိုတွေယူမယ်
          const videoList = await pb.collection('videos').getFullList({
            filter: `channel = "${channel.id}"`,
            sort: '-published_at',
            requestKey: null,
          });
          setVideos(videoList);

          // ၃။ Playlist တွေယူမယ်
          const playlistList = await pb.collection('playlists').getFullList({
            filter: `channel = "${channel.id}"`,
            requestKey: null,
          });
          setPlaylists(playlistList);
        }
      } catch (error) {
        console.error("Data Fetch Error:", error);
      }
    }
    fetchData();
  }, [decodedName]);

  return (
    <main className="min-h-screen bg-[#051139] text-white pb-20">
      {/* 🖼️ Channel Banner */}
      <div className="relative h-44 w-full overflow-hidden">
        {channelData?.banner ? (
          <img src={channelData.banner} className="w-full h-full object-cover" alt="Banner" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-blue-700/50 to-[#051139]" />
        )}
        <Link href="/" className="absolute top-4 left-4 p-2 bg-black/40 rounded-full backdrop-blur-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>

      {/* 👤 Profile Section */}
      <div className="px-4 -mt-10 relative flex flex-col items-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#051139] overflow-hidden bg-gray-800 shadow-2xl">
          <img 
            src={channelData?.logo || `https://ui-avatars.com/api/?name=${decodedName}`} 
            className="w-full h-full object-cover" 
            alt="Logo"
          />
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-center">{decodedName}</h1>
        
        {/* 🛠️ Action Switcher */}
        <div className="flex gap-3 mt-6 w-full max-w-sm px-4">
          <button 
            onClick={() => setActiveTab("videos")}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'videos' ? 'bg-blue-600 shadow-lg scale-105' : 'bg-white/5 border border-white/10 text-gray-400'}`}
          >
            Videos ({videos.length})
          </button>
          <button 
            onClick={() => setActiveTab("playlists")}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'playlists' ? 'bg-blue-600 shadow-lg scale-105' : 'bg-white/5 border border-white/10 text-gray-400'}`}
          >
            Playlists ({playlists.length})
          </button>
        </div>
      </div>

      {/* 📺 Content List */}
      <div className="p-4 mt-6 space-y-5">
{activeTab === "videos" ? (
  videos.length > 0 ? videos.map((video) => (
    <Link href={`/watch/${video.id}`} key={video.id} className="flex gap-4 group active:scale-[0.98] transition-transform">
      <div className="relative w-36 aspect-video rounded-xl overflow-hidden flex-shrink-0 border border-white/5 shadow-lg">
        <img src={`https://img.youtube.com/vi/${video.video_id || video.url}/hqdefault.jpg`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={video.title} />
        <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold">00:00</div>
      </div>
      <div className="flex flex-col justify-center flex-1">
        <h3 className="text-[14px] font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-[10px] text-gray-500 mt-1.5 font-medium">Recap Box • 2026</p>
      </div>
    </Link>
  )) : <div className="text-center py-10 text-gray-500">ဗီဒီယို မရှိသေးပါဘူးရှင်</div>
) : (
  /* 📺 Playlist Section - ပုံမဖုံးဘဲ ကြည်လင်တဲ့ Design */
  playlists.length > 0 ? playlists.map((pl) => (
  <Link href={`/playlist/${pl.id}`} key={pl.id} className="flex gap-4 group active:scale-[0.98] transition-transform">
    {/* 🖼️ Thumbnail Section */}
    <div className="relative w-36 aspect-video rounded-xl overflow-hidden flex-shrink-0 border border-white/5 shadow-lg bg-gray-100">
      <img 
        src={pl.thumbnail || `https://img.youtube.com/vi/${pl.playlist_id}/hqdefault.jpg`} 
        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
        alt={pl.title}
      />
      
      {/* 🏷️ Playlist Badge - ပုံကိုမဖုံးဘဲ ညာဘက်အောက်ခြေမှာပဲ ထားမယ် */}
      <div className="absolute inset-y-0 right-0 w-1/3 /20 backdrop-blur-sm flex flex-col items-center justify-center border-1/10">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeWidth={2.5} strokeLinecap="round"/>
        </svg>
        
      </div>
    </div>

    {/* 📝 Playlist Info */}
    <div className="flex-1 flex flex-col justify-center">
      <h3 className="text-[15px] font-extrabold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
        {pl.title}
      </h3>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Playlist</span>
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        <span className="text-[10px] text-gray-500 font-medium">View all →</span>
      </div>
  </div>
</Link>
        )) : <div className="text-center py-10 text-gray-500">Playlist မရှိသေးပါဘူးရှင်</div>
      )}
    </div>
  </main>
  );
}
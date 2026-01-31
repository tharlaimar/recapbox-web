"use client";

import { useEffect, useState } from "react";
import { R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ manga: [], novels: [], videos: [], reels: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 2) {
        setResults({ manga: [], novels: [], videos: [], reels: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${query}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Helper Function for Grid
  const RenderSection = ({ title, items, path, color }: any) => {
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className={`text-[10px] font-black uppercase ${color} mb-4 tracking-[0.2em] px-2 border-l-2 ml-1`}>
        {title}
      </h2>
      {/* 🛡️ Path အလိုက် Grid Column အရေအတွက်ကို ညှိမယ် */}
      <div className={`grid gap-3 ${path === 'videos' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {items.map((item: any) => {
          
          let imageUrl = "/no-image.png";

          if (path === 'manga' || path === 'novels') {
            if (item.image) imageUrl = `${R2_DOMAIN}/${item.collectionId}/${item.id}/${item.image}`;
          } 
          else if (path === 'videos') {
            // 🔥 Videos က Thumbnail URL ဆိုရင် R2 Domain မလိုဘဲ တိုက်ရိုက်ယူမယ်
            imageUrl = item.thumbnail || item.thumbnail_url || "/no-image.png"; 
          } 
          else if (path === 'reels') {
            if (item.cover_image) imageUrl = `${R2_DOMAIN}/${item.collectionId}/${item.id}/${item.cover_image}`;
          }

          return (
            <Link key={item.id} href={`/${path}/${item.id}`} className="group active:scale-95 transition-all">
              <div className="bg-[#0a192f]/60 rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                {/* 📏 Aspect Ratio Logic: Videos ဆိုရင် 16/9 ကျန်တာ 3/4 */}
                <div className={`relative ${path === 'videos' ? 'aspect-video' : 'aspect-[3/4]'}`}>
                  <img 
                    src={imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e: any) => { e.target.src = "/no-image.png" }} 
                  />
                  {/* Play Overlay for Videos/Reels */}
                  {(path === 'videos' || path === 'reels') && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="bg-blue-600/80 p-2 rounded-full shadow-lg">
                         <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                       </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                   <p className="text-[11px] font-bold truncate group-hover:text-blue-400">
                     {item.title}
                   </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
  return (
    <div className="min-h-screen bg-[#051139] text-white p-4 pb-24">
      <div className="sticky top-0 z-50 py-4 bg-[#051139]">
        <input
          type="text"
          placeholder="Search everything..."
          className="w-full bg-[#0a192f] border border-white/10 rounded-2xl py-4 px-6 text-sm focus:border-blue-500 outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <div className="mt-2 text-[10px] text-blue-500 animate-pulse text-center font-bold">Searching...</div>}
      </div>

      <div className="mt-4">
        <RenderSection title="Manga" items={results.manga} path="manga" color="text-blue-400 border-blue-400" />
        <RenderSection title="Novels" items={results.novels} path="novels" color="text-yellow-500 border-yellow-500" />
        <RenderSection title="Videos" items={results.videos} path="videos" color="text-red-500 border-red-500" />
        <RenderSection title="Reel Series" items={results.reels} path="reels" color="text-green-500 border-green-500" />
        
        {query.length > 1 && !loading && Object.values(results).every((arr: any) => arr.length === 0) && (
          <div className="text-center py-20 text-gray-500 font-bold italic text-xs">ဘာမှရှာမတွေ့ဘူး ... 🥺</div>
        )}
      </div>
    </div>
  );
}
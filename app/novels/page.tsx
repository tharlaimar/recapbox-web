"use client";

import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";
import { useEffect, useState } from "react";
import ContinueReading from "../components/ContinueReading";

export default function NovelLibrary() {
  const [records, setRecords] = useState<any[]>([]);
  const [editorsChoice, setEditorsChoice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // ၁။ Novel အကုန်လုံးကို ဆွဲထုတ်မယ်
        const novelData = await pb.collection('novels').getFullList({
          sort: '-created',
          requestKey: null,
        });

        // ၂။ Rating တွေကို ဆွဲထုတ်မယ်
        const ratingsData = await pb.collection('ratings').getFullList({
          requestKey: null,
          fields: 'novel,rating', 
        });

        // ၃။ Data တွဲမယ်
        const mergedData = novelData.map((novel) => {
           const myRatings = ratingsData.filter((r) => r.novel === novel.id);
           let avg = "0.0";
           if (myRatings.length > 0) {
              const sum = myRatings.reduce((acc, r) => acc + (r.rating || 0), 0);
              avg = (sum / myRatings.length).toFixed(1); 
           }
           return { ...novel, average_rating: avg };
        });

        setRecords(mergedData);
        
        // ၄။ Editor's Choice သီးသန့် Filter ထုတ်မယ်
        // PocketBase မှာ editor_choice (checkbox/bool) field ရှိရပါမယ်
        const choices = mergedData.filter((n: any) => n.is_editor_choice === true);
setEditorsChoice(choices);

      } catch (error) {
        console.error("Novel Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-4 pb-24 text-white">
      
      {/* 🔥 Continue Reading Section */}
      <div className="mb-10">
        <ContinueReading filterType="novel" />
      </div>

      {/* 🌟 Editor's Choice Section (Horizontal Scroll) */}
      {editorsChoice.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🌟</span>
            <h2 className="text-xl font-black uppercase tracking-tighter text-yellow-500">
              Editor's Choice
            </h2>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {editorsChoice.map((novel) => (
              <Link 
                key={novel.id} 
                href={`/novels/${novel.id}`} 
                className="flex-none w-[280px] group relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              >
                {/* Background Image with Overlay */}
                <div className="relative aspect-[16/9] w-full">
                  <img 
                    src={`${R2_DOMAIN}/${novel.collectionId}/${novel.id}/${novel.image}`} 
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051139] via-transparent to-transparent"></div>
                  
                  {/* Rating Label */}
                  <div className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    ⭐ {novel.average_rating}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-sm font-black truncate text-white mb-1">
                    {novel.title}
                  </h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                    {novel.author || "Premium Novel"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 📖 Regular Novel Library Grid */}
      <div className="flex items-center justify-between mb-8 mt-2 px-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-blue-500 pl-3">
          📖 Novel Library
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {records.map((novel) => (
          <Link key={novel.id} href={`/novels/${novel.id}`} className="group block active:scale-95 transition-transform">
            <div className="bg-[#0a192f]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all">
              <div className="relative aspect-[3/4] w-full">
                <img 
                  src={`${R2_DOMAIN}/${novel.collectionId}/${novel.id}/${novel.image}`} 
                  alt={novel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1 z-10">
                    <span className="text-[9px] font-black text-white">
                      ⭐ {novel.average_rating > 0 ? novel.average_rating : "New"}
                    </span>
                </div>
                <div className="absolute top-2 left-2 bg-blue-600/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                  <span className="text-[9px] font-black text-white uppercase tracking-tighter">Novel</span>
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-[13px] font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors min-h-[32px]">
                  {novel.title}
                </h3>
                <p className="text-[9px] text-gray-500 mt-2 font-black uppercase tracking-widest truncate">
                  {novel.author || "Unknown Author"}
                </p>
                <div className="mt-2 flex items-center gap-1">
                   <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                   <span className="text-[9px] font-bold text-blue-500/80 uppercase">Free Reading</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
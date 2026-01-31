"use client";

import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SeriesLibrary() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // ၁။ Series တွေကို အရင်ဆွဲထုတ်မယ်
        const seriesData = await pb.collection('reel_series').getFullList({
          sort: '-created',
          requestKey: null,
        });

        // ၂။ Rating တွေကို ဆွဲထုတ်မယ် (Series အတွက် score field ကို ယူရမယ်)
        const ratingsData = await pb.collection('ratings').getFullList({
          requestKey: null,
          fields: 'series,score', // ⚠️ Series အတွက် score ကို ယူမှရမယ်
          filter: 'series != ""', // Series နဲ့ဆိုင်တဲ့ Rating တွေကိုပဲ ယူမယ်
        });

        // ၃။ Merge Data
        const mergedData = seriesData.map((item) => {
           // ဒီ Series ID နဲ့ သက်ဆိုင်တဲ့ Rating တွေကို စစ်ထုတ်မယ်
           const myRatings = ratingsData.filter((r) => r.series === item.id);
           
           let avg = "0.0";
           if (myRatings.length > 0) {
              // ⚠️ score ကို ပေါင်းရမယ် (rating မဟုတ်ဘူး)
              const sum = myRatings.reduce((acc, r) => acc + (r.score || 0), 0);
              const calculated = sum / myRatings.length;
              avg = calculated.toFixed(1); 
           }

           return { ...item, average_rating: avg };
        });

        setRecords(mergedData);
      } catch (error) {
        console.error("Series Fetch Error:", error);
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
    // ⚠️ Layout.tsx နဲ့ Main Tag မထပ်အောင် div သုံးထားတယ်
    <div className="min-h-screen bg-transparent p-4 pb-24 text-white">
      <div className="flex items-center justify-between mb-8 mt-2 px-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-blue-500 pl-3">
          📺 Series & Donghua
        </h1>
      </div>

      {/* 🖼️ Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {records.map((item) => (
          <Link key={item.id} href={`/series/${item.id}`} className="group block active:scale-95 transition-transform">
            
            {/* 📦 Card Container */}
            <div className="bg-[#0a192f]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all">
              
              {/* 📏 Aspect Ratio [3/4] */}
              <div className="relative aspect-[3/4] w-full">
                <img 
                  src={`${R2_DOMAIN}/${item.collectionId}/${item.id}/${item.cover_image}`} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                
                {/* 🔥 Rating Badge (Top Right) */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1 z-10">
                    <span className="text-[9px] font-black text-white">
                      ⭐ {item.average_rating > 0 ? item.average_rating : "New"}
                    </span>
                </div>

                {/* 🏷️ Type Badge (Moved to Top Left) */}
                <div className="absolute top-2 left-2 bg-blue-600/50 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
                  <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                    {item.type || "Series"}
                  </span>
                </div>
              </div>

              {/* 📝 Info Area */}
              <div className="p-3">
                <h3 className="text-[12px] font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors min-h-[32px]">
                  {item.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-gray-500">
                     {item.total_episodes || "Ongoing"} Eps
                   </span>
                   <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
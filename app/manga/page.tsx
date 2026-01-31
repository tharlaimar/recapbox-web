"use client";

import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";
import { useEffect, useState } from "react";
import ContinueReading from "../components/ContinueReading"; // Import

export default function MangaLibrary() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (Data Fetching Logic အဟောင်းအတိုင်း) ...
  useEffect(() => {
    async function fetchData() {
      try {
        const mangaData = await pb.collection('manga').getFullList({ sort: '-created', requestKey: null });
        const ratingsData = await pb.collection('ratings').getFullList({ requestKey: null, fields: 'manga,rating' });

        const mergedData = mangaData.map((manga) => {
           const myRatings = ratingsData.filter((r) => r.manga === manga.id);
           let avg = "0.0";
           if (myRatings.length > 0) {
             const sum = myRatings.reduce((acc, r) => acc + (r.rating || 0), 0);
             avg = (sum / myRatings.length).toFixed(1);
           }
           return { ...manga, average_rating: avg };
        });
        setRecords(mergedData);
      } catch (error) { console.error("Manga Fetch Error:", error); } 
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div></div>;

  const filterByType = (type: string) => records.filter(item => item.type === type);

  // Section Component (Logic အဟောင်း)
  const MangaSection = ({ title, items, categoryType }: { title: string, items: any[], categoryType: string }) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-10 bg-transparent">
        <div className="flex items-center justify-between mb-4 px-3">
          <h2 className="text-lg font-black text-white border-l-4 border-blue-500 pl-3 uppercase tracking-tighter">{title}</h2>
          <Link href={`/manga/category/${categoryType}`} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-blue-500 transition-colors">See All →</Link>
        </div>
        <div className="flex overflow-x-auto gap-4 px-3 pb-4 scrollbar-hide select-none">
          {items.map((item) => (
            <Link key={item.id} href={`/manga/${item.id}`} className="min-w-[130px] w-[130px] group block">
              <div className="bg-[#0a192f]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-transform duration-300 group-active:scale-95">
                <div className="relative aspect-[3/4] w-full">
                  <img src={`${R2_DOMAIN}/${item.collectionId}/${item.id}/${item.image}`} className="w-full h-full object-cover" alt={item.title} loading="lazy" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
                    <span className="text-[9px] font-black text-white">⭐ {item.average_rating > 0 ? item.average_rating : "New"}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-[12px] font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors min-h-[32px]">{item.title}</h3>
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-blue-500/80 uppercase tracking-tighter">Read Now</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen pb-24 pt-4 bg-transparent">
      
      {/* 🔥 Continue Reading Section (Manga Only) */}
      <div className="mb-6">
        <ContinueReading filterType="manga" /> 
      </div>

      <MangaSection title="🔥 Popular" items={records.slice(0, 8)} categoryType="Popular" />
      <MangaSection title="🇰🇷 Manhwa" items={filterByType("Manhwa")} categoryType="Manhwa" />
      <MangaSection title="🇨🇳 Manhua" items={filterByType("Manhua")} categoryType="Manhua" />
      <MangaSection title="🇯🇵 Manga" items={filterByType("Manga")} categoryType="Manga" />
      <MangaSection title="🇲🇲 Myanmar" items={filterByType("Myanmar Comic")} categoryType="Myanmar Comic" />
    </div>
  );
}
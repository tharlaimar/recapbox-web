"use client";

import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContinueReading({ filterType }: { filterType?: 'manga' | 'novel' | 'video' }) {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      if (!pb.authStore.isValid || !pb.authStore.model?.id) return;
      setIsVisible(true);

      try {
        const userId = pb.authStore.model.id;
        let filter = `user = "${userId}"`;
        if (filterType) {
           filter += ` && type = "${filterType}"`;
        }

        const res = await pb.collection('reading_history').getList(1, 50, { // 🛡️ တိုးယူလိုက်မယ် ပြီးမှ unique လုပ်မယ်
          filter: filter,
          sort: '-updated',
          expand: 'manga,novel,video,read_chapter,last_chapter', 
        });

        // 🔥 [UNIQUE LOGIC] Novel/Manga ID တူတာတွေပါနေရင် အသစ်ဆုံးတစ်ခုပဲယူမယ်
        const uniqueData = res.items.reduce((acc: any[], current: any) => {
          // Manga သို့မဟုတ် Novel ID ကို ရှာမယ်
          const currentContentId = current.manga || current.novel || current.video;
          const isExist = acc.find(item => (item.manga || item.novel || item.video) === currentContentId);
          
          if (!isExist) {
            return acc.concat([current]);
          }
          return acc;
        }, []);
        
        setHistoryItems(uniqueData.slice(0, 10)); // ၁၀ ခုပဲ ပြမယ်
      } catch (e) {
        console.log("History fetch error:", e);
      }
    }
    fetchHistory();
  }, [filterType]);

  if (!isVisible || historyItems.length === 0) return null;

  return (
    <section className="mb-8 px-4">
      <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 border-l-4 border-yellow-500 pl-3">
        Continue {filterType === 'video' ? 'Watching' : 'Reading'}
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        {historyItems.map((item) => {
          const type = item.type;
          let data: any = null;
          let link = "/";
          let chapterTitle = "Continue";

          if (type === 'manga' && item.expand?.manga) {
            data = item.expand.manga;
            link = `/manga/${data.id}/read/${item.last_chapter}`;
            const ch = item.expand?.last_chapter;
            chapterTitle = ch ? (ch.title || `Ch. ${ch.chapter_number}`) : "Resume";

          } else if (type === 'novel' && item.expand?.novel) {
            data = item.expand.novel;
            link = `/novels/${data.id}/read/${item.read_chapter}`;
            const ch = item.expand?.read_chapter;
            // 🛡️ TITLE ထည့်တာ မှားနေရင် ID အစစ်နဲ့ ပြန်ချိတ်ဖို့ logic
            chapterTitle = ch ? (ch.title || `Ch. ${ch.chapter_number}`) : "Resume";

          } else if (type === 'video' && item.expand?.video) {
            data = item.expand.video;
            link = `/watch/${data.id}`;
            chapterTitle = "Resume";
          }

          if (!data) return null;

          const imgFileName = data.image || data.cover_image || data.thumbnail;
          const imgUrl = imgFileName 
            ? `${R2_DOMAIN}/${data.collectionId}/${data.id}/${imgFileName}`
            : "/default-cover.png";

          return (
            <Link key={item.id} href={link} className="min-w-[140px] w-[140px] group block">
               <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[#0a192f]">
                  <img 
                    src={imgUrl} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    alt={data.title}
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8">
                     <p className="text-[9px] text-yellow-500 font-bold truncate uppercase tracking-wider">
                       {chapterTitle}
                     </p>
                     <h4 className="text-[11px] font-black text-white line-clamp-2 leading-tight mt-0.5">
                       {data.title}
                     </h4>
                  </div>
               </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
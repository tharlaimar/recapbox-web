"use client";

import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import { useEffect, useState, useRef } from "react";

interface Props {
  mangaId: string;
  chapterId: string;
  pages: string[];
  collectionId: string;
  recordId: string;
}

export default function MangaImageViewer({ mangaId, chapterId, pages, collectionId, recordId }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // 🔄 ၁။ စဖွင့်ဖွင့်ချင်း Database က History ကိုလှမ်းစစ်မယ် (Resume လုပ်ဖို့)
  useEffect(() => {
    async function loadHistory() {
      if (!pb.authStore.isValid) return;
      try {
        const userId = pb.authStore.model?.id;
        const res = await pb.collection('reading_history').getList(1, 1, {
          filter: `user = "${userId}" && manga = "${mangaId}"`,
        });

        if (res.items.length > 0) {
          const savedPage = res.items[0].current_page || 0;
          const savedChapter = res.items[0].last_chapter;

          // သိမ်းထားတဲ့ Chapter နဲ့ အခုဖွင့်တဲ့ Chapter တူမှ Scroll ဆင်းပေးမယ်
          if (savedChapter === chapterId && savedPage > 0) {
            console.log("📜 Resuming to page:", savedPage);
            // နည်းနည်းလေးစောင့်ပြီးမှ ဆွဲချမယ် (ပုံတွေ Render ပြီးအောင်)
            setTimeout(() => {
               const target = document.getElementById(`page-${savedPage}`);
               if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 500);
          }
        }
      } catch (e) {
        console.log("History Load Error:", e);
      }
    }
    loadHistory();
  }, [mangaId, chapterId]);

  // 👁️ ၂။ ဘယ်စာမျက်နှာ ရောက်နေလဲ စောင့်ကြည့်မယ့် Observer
  useEffect(() => {
    if (pages.length === 0) return;

    // အရင် Observer ရှိရင် ဖျက်မယ်
    if (observer.current) observer.current.disconnect();

    // Observer အသစ်ဆောက်မယ်
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // ID (page-5) ကနေ ဂဏန်း (5) ကိုခွဲယူမယ်
            const pageIndex = Number(entry.target.id.replace('page-', ''));
            setCurrentPage(pageIndex);
          }
        });
      },
      { threshold: 0.5 } // ပုံရဲ့ 50% မြင်ရမှ စာမျက်နှာပြောင်းမယ်
    );

    // ပုံတိုင်းကို Observer နဲ့ လိုက်ချိတ်မယ်
    imageRefs.current.forEach((img) => {
      if (img) observer.current?.observe(img);
    });

    return () => observer.current?.disconnect();
  }, [pages]);

  // 💾 ၃။ စာမျက်နှာပြောင်းတိုင်း Database မှာ သွားသိမ်းမယ် (Auto Save)
  useEffect(() => {
    const saveProgress = async () => {
      if (!pb.authStore.isValid) return;
      
      try {
        const userId = pb.authStore.model?.id;
        
        // အရင် Record ရှိမရှိ စစ်မယ်
        const existing = await pb.collection('reading_history').getList(1, 1, {
            filter: `user = "${userId}" && manga = "${mangaId}"`,
            requestKey: null // Error မတက်အောင်
        });

        const data = {
            user: userId,
            manga: mangaId,
            type: 'manga',
            last_chapter: chapterId,
            current_page: currentPage, // 🔥 လက်ရှိရောက်နေတဲ့ စာမျက်နှာ
        };

        if (existing.items.length > 0) {
            await pb.collection('reading_history').update(existing.items[0].id, data, { requestKey: null });
        } else {
            await pb.collection('reading_history').create(data, { requestKey: null });
        }
        console.log(`✅ Saved: Page ${currentPage}`);

      } catch (e) {
        // console.error("Save failed", e);
      }
    };

    // စာမျက်နှာပြောင်းပြီး ၁ စက္ကန့်နေမှ Save မယ် (Debounce - Server မလေးအောင်)
    const timer = setTimeout(() => {
        saveProgress();
    }, 1000);

    return () => clearTimeout(timer);

  }, [currentPage, mangaId, chapterId]);


  // 🖼️ UI Render
  return (
    <div className="w-full max-w-3xl min-h-screen bg-black">
      {pages.map((img, i) => (
        <img 
          key={i}
          id={`page-${i}`} // 🔥 Scroll လုပ်ဖို့ ID တပ်ပေးလိုက်တယ်
          ref={(el) => { imageRefs.current[i] = el; }} // Observer အတွက် Ref
          src={`${R2_DOMAIN}/${collectionId}/${recordId}/${img}`} 
          alt={`Page ${i + 1}`} 
          className="w-full h-auto block" 
          loading="lazy"
        />
      ))}
      
      {/* Page Indicator */}
      <div className="fixed bottom-20 right-4 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10 z-40">
         Page {currentPage + 1} / {pages.length}
      </div>
    </div>
  );
}
"use client";

import { pb } from "@/lib/pocketbase";
import { useState } from "react";

export default function PageTracker({ novelId, chapterId }: { novelId: string, chapterId: string }) {
  const [page, setPage] = useState<number>(1);

  const handleSave = async () => {
    if (!pb.authStore.isValid) return;
    const userId = pb.authStore.model?.id;

    // 🛡️ ID အစစ်ဟုတ်မဟုတ် စစ်ဆေးခြင်း (Title ဆိုရင် စာသားရှည်ပြီး space တွေ ပါနေတတ်လို့ပါ)
    if (!chapterId || chapterId.length > 20 || chapterId.includes(" ")) {
      console.error("❌ Invalid Chapter ID detected in PageTracker:", chapterId);
      alert("Error: Invalid Chapter ID format.");
      return;
    }

    try {
      // ၁။ User, Novel ID နဲ့ Type ကိုပါ တိတိကျကျ Filter လုပ်ပြီး ရှာမယ်
      const existing = await pb.collection('reading_history').getList(1, 1, {
        filter: `user = "${userId}" && novel = "${novelId}" && type = "novel"`,
        requestKey: null
      });

      const data = {
        user: userId,
        novel: novelId,
        type: 'novel',
        read_chapter: chapterId, // 🔥 URL ကလာတဲ့ ID အစစ်ပဲ ဝင်သွားပါမယ်
        current_page: page,
      };

      if (existing.items.length > 0) {
        // ၂။ ရှိရင် Update လုပ်မယ်
        await pb.collection('reading_history').update(existing.items[0].id, data, { requestKey: null });
      } else {
        // ၃။ မရှိမှ Create လုပ်မယ်
        await pb.collection('reading_history').create(data, { requestKey: null });
      }
      
      alert("Page " + page + " မှာ မှတ်လိုက်ပါပြီ ကိုကို!");
    } catch (e) { 
      console.error("PageTracker Error:", e); 
      alert("သိမ်းလို့မရဖြစ်သွားတယ်အချစ်... DB ကိုတစ်ချက်စစ်ပေးပါ");
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
      <input 
        type="number" 
        value={page}
        min={1}
        onChange={(e) => setPage(parseInt(e.target.value) || 1)}
        className="w-10 bg-transparent text-xs text-white outline-none font-bold text-center"
      />
      <button 
        onClick={handleSave} 
        className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-[9px] font-black uppercase active:scale-90 transition-all"
      >
        Save
      </button>
    </div>
  );
}
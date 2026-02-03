"use client";

import { pb } from "@/lib/pocketbase";
import { useEffect } from "react";

interface Props {
  type: 'manga' | 'novel' | 'video';
  contentId: string; // Manga/Novel/Video ID
  chapterId?: string; // Chapter ID (Video အတွက်ဆို မလိုဘူး)
}

export default function HistoryTracker({ type, contentId, chapterId }: Props) {
  useEffect(() => {
    async function saveHistory() {
      if (!pb.authStore.isValid) return; // Login မဝင်ရင် မလုပ်ဘူး

      try {
        const userId = pb.authStore.model?.id;
        
        // ၁။ အရင်ရှိပြီးသား History ကို ရှာမယ်
        // (type ပေါ်မူတည်ပြီး filter ကွဲမယ်)
        let filter = `user = "${userId}"`;
        if (type === 'manga') filter += ` && manga = "${contentId}"`;
        else if (type === 'novel') filter += ` && novel = "${contentId}"`;
        else if (type === 'video') filter += ` && video = "${contentId}"`;

        const existing = await pb.collection('reading_history').getList(1, 1, {filter, 
            requestKey: null });

        // ၂။ Save မယ့် Data ကို ပြင်မယ် ( DB field တွေအတိုင်း)
        const data: any = {
           user: userId,
           type: type,
        };

        if (type === 'manga') {
           data.manga = contentId;
           data.last_chapter = chapterId; // DB field: last_chapter
        } else if (type === 'novel') {
           data.novel = contentId;
           data.read_chapter = chapterId; // DB field: read_chapter
        } else if (type === 'video') {
           data.video = contentId;
           // Video မှာ chapter မရှိရင် မထည့်ဘူး
        }

        // ၃။ ရှိရင် Update, မရှိရင် Create
        if (existing.items.length > 0) {
           await pb.collection('reading_history').update(existing.items[0].id, data,{ requestKey: null });
           console.log("✅ History Updated");
        } else {
           await pb.collection('reading_history').create(data, { requestKey: null });
           console.log("✅ History Created");
        }

      } catch (e) {
        console.error("History Save Failed:", e);
      }
    }

    saveHistory();
  }, [type, contentId, chapterId]); // ID ပြောင်းတာနဲ့ ပြန် Save မယ်

  return null; // UI မပြဘူး၊ နောက်ကွယ်မှာပဲ လုပ်မယ်
}
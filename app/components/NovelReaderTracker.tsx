"use client";
import { pb } from "@/lib/pocketbase";
import { useEffect } from "react";

export default function NovelReaderTracker({ novelId, chapterId }: { novelId: string, chapterId: string }) {
  useEffect(() => {
    const updateHistory = async () => {
      if (!pb.authStore.isValid || !pb.authStore.model?.id) return;
      const userId = pb.authStore.model.id;

      // 🛡️ ID အစစ်ဟုတ်မဟုတ် စစ်မယ် (Title ဆိုရင် နေရာလွတ်တွေ ပါနေတတ်တယ်)
      if (chapterId.includes(" ") || chapterId.length > 20) {
        console.error("❌ Invalid ID detected (Skipping save):", chapterId);
        return;
      }

      try {
        const existing = await pb.collection('reading_history').getList(1, 1, {
          filter: `user = "${userId}" && novel = "${novelId}"`,
          requestKey: null
        });

        const data = {
          user: userId,
          novel: novelId,
          type: 'novel',
          read_chapter: chapterId, // 🔥 ID အစစ်ပဲ သိမ်းမယ်
        };

        if (existing.items.length > 0) {
          await pb.collection('reading_history').update(existing.items[0].id, data, { requestKey: null });
        } else {
          await pb.collection('reading_history').create(data, { requestKey: null });
        }
      } catch (e) { console.error(e); }
    };
    updateHistory();
  }, [novelId, chapterId]);

  return null;
}
"use client";

import { useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { useRouter } from "next/navigation";

interface StarRatingProps {
  collectionName: "manga" | "series" | "novel"; // ဘယ်အမျိုးအစားလဲ
  itemId: string; // သူ့ရဲ့ ID (MangaID or SeriesID)
}

export default function StarRating({ collectionName, itemId }: StarRatingProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ၁။ User အရင်ပေးဖူးတာ ရှိမရှိ စစ်မယ်
  useEffect(() => {
    const fetchRating = async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        try {
          // Field name ခွဲခေါ်မယ် (Manga ဆို 'manga', Series ဆို 'series')
          const fieldName = collectionName === "series" ? "series" : collectionName;
          
          const records = await pb.collection("ratings").getList(1, 1, {
            filter: `user = "${pb.authStore.model.id}" && ${fieldName} = "${itemId}"`,
          });

          if (records.items.length > 0) {
            // 🔥 DB မှာ column မတူတာကို ဒီမှာ ညှိမယ်
            // Manga/Novel => data['rating']
            // Series => data['score']
            const val = collectionName === "series" 
              ? records.items[0].score 
              : records.items[0].rating;
              
            setRating(val || 0);
          }
        } catch (e) {
          console.log("Error fetching rating", e);
        }
      }
    };

    fetchRating();
  }, [collectionName, itemId]);

  // ၂။ ကြယ်နှိပ်လိုက်ရင် Update လုပ်မယ့် Function
  const handleRate = async (score: number) => {
    if (!pb.authStore.isValid) {
      alert("Please login to rate!");
      router.push("/login");
      return;
    }

    setLoading(true);
    setRating(score); // UI မှာ ချက်ချင်းပြောင်းမယ်

    try {
      const userId = pb.authStore.model?.id;
      const fieldName = collectionName === "series" ? "series" : collectionName;

      // အရင်ပေးဖူးလား စစ်မယ်
      const existing = await pb.collection("ratings").getList(1, 1, {
        filter: `user = "${userId}" && ${fieldName} = "${itemId}"`,
      });

      // Data Body ပြင်ဆင်မယ်
      const data: any = {
        user: userId,
      };
      // ID ထည့်မယ် (Relation ချိတ်ဖို့)
      data[fieldName] = itemId;
      
      // 🔥 Value ထည့်မယ် (Manga ဆို rating, Series ဆို score)
      if (collectionName === "series") {
        data.score = score;
      } else {
        data.rating = score;
      }

      if (existing.items.length > 0) {
        // ရှိပြီးသားဆို Update (ID ယူပြီး ပြင်မယ်)
        await pb.collection("ratings").update(existing.items[0].id, data);
      } else {
        // မရှိသေးရင် အသစ်ဆောက်
        await pb.collection("ratings").create(data);
      }
      router.refresh();

      // Success Feedback (Optional)
      // alert("Thanks for rating!"); 
    } catch (e) {
      console.error("Rating Error:", e);
      alert("Rating failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            className={`text-2xl transition-colors ${
              starValue <= (hover || rating) ? "text-yellow-500" : "text-gray-600"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
            onClick={() => handleRate(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(rating)}
            disabled={loading}
          >
            ★
          </button>
        );
      })}
      <span className="ml-2 text-xs text-gray-400 font-bold uppercase">
        {rating > 0 ? `${rating}/5` : "Rate Now"}
      </span>
    </div>
  );
}
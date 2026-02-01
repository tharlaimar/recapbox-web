// lib/pocketbase.ts
import PocketBase from 'pocketbase';

// 🔥 ကိုကို့ VPS (သို့) Local IP
export const pb = new PocketBase('https://api.recapboxx.com');

export const R2_DOMAIN = "https://file.recapboxx.com";

// lib/pocketbase.ts သို့မဟုတ် သက်ဆိုင်ရာ နေရာမှာ ထည့်ပါ
export async function getAnnouncements() {
  try {
    const records = await pb.collection('announcements').getFullList({
      sort: '-created', // အသစ်ဆုံးကို အပေါ်ကထားမယ်
    });
    return records;
  } catch (error) {
    console.error("Announcements fetch error:", error);
    return [];
  }
}
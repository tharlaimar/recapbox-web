import { pb } from "@/lib/pocketbase";
import { cookies } from "next/headers";

export async function getFreshUser() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("pb_auth");

  if (!authCookie?.value) return null;

  try {
    let token = "";
    let modelId = "";

    try {
      const raw = decodeURIComponent(authCookie.value);
      
      if (raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        token = parsed.token;
        modelId = parsed.model?.id;
      } else {
        token = raw;
        // Token ပဲရှိရင် SDK ကနေ modelId ပြန်ရှာမယ်
        pb.authStore.save(token, null);
        modelId = pb.authStore.model?.id || "";
      }
    } catch (e) {
      token = authCookie.value;
    }

    if (!token) return null;

    // 🔥 FIXED: 'as any' ထည့်လိုက်တော့ TypeScript error ပျောက်သွားပါပြီ
    pb.authStore.save(token, modelId ? { id: modelId } as any : null);

    // Model ID မရှိရင် authRefresh နဲ့ ယူမယ်
    if (!modelId && pb.authStore.isValid) {
       try {
         const authData = await pb.collection("users").authRefresh();
         return authData.record;
       } catch (e) { return null; }
    }

    // Database ကို Cache Buster နဲ့ လှမ်းမေးမယ်
    if (modelId) {
      try {
        const freshUser = await pb.collection("users").getOne(modelId, {
          requestKey: null, 
          headers: { "Cache-Control": "no-store" },
          // @ts-ignore
          query: { t: Date.now() } 
        });
        if (freshUser.is_vip === true && freshUser.vip_expiry_date) {
            const expiryDate = new Date(freshUser.vip_expiry_date);
            const now = new Date();

            // ရက်လွန်နေပြီဆိုရင်
            // get-user.ts ရဲ့ VIP expiry စစ်တဲ့အပိုင်းမှာ
if (now > expiryDate) {
    console.log(`🚫 VIP Expired for ${freshUser.email}. Auto Downgrading...`);

    try {
        // 🔥 $autoCancel: false ထည့်မှ error မတက်မှာပါ
        await pb.collection("users").update(freshUser.id, { 
            is_vip: false, 
        }, { 
            $autoCancel: false 
        });

        // ချက်ချင်းသက်ရောက်မှုရှိအောင် data ကိုပါ ပြောင်းလိုက်မယ်
        freshUser.is_vip = false;
    } catch (err) {
        console.error("Failed to downgrade user:", err);
    }
}
        }
        // 🔥🔥🔥 END: VIP AUTO EXPIRY CHECK 🔥🔥🔥
        return freshUser;
      } catch (e) { return null; }
    }

    return null;
  } catch (err) {
    return null; 
  }
}
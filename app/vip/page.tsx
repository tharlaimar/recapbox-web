"use client";

import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";

export default function VIPPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // 🔴🔴🔴 KEY များ
  const IMGBB_API_KEY = "13f6f317dd08cf5b34fe4193c8d80380";
  const TELEGRAM_BOT_TOKEN = "8335167806:AAH6cbCe-w35EVHw_ekXq4TEobyOlxitnAo";
  const TELEGRAM_CHAT_ID = "-1003372675502";

  // 🔥 Copy Function
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(text);
    setTimeout(() => setCopyStatus(null), 2000); // ၂ စက္ကန့်ကြာရင် ပြန်ဖျောက်မယ်
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file || !transactionId) {
      alert("Screenshot နဲ့ Transaction ID ထည့်ပေးပါဦး");
      return;
    }
    if (transactionId.length < 6) {
      alert("⚠️ လုပ်ငန်းစဉ်နံပါတ် (Transaction ID) အနည်းဆုံး ၆ လုံး ရိုက်ထည့်ပေးမှ ရပါမယ်");
      return;
    }

    setLoading(true);
    setStatus("Processing Payment...");

    try {
      // 1️⃣ ImgBB ကို အရင်တင်မယ်
      const formData = new FormData();
      formData.append("image", file);
      const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const imgData = await imgRes.json();
      const imageUrl = imgData.data.url;

      // 2️⃣ PocketBase Database ထဲမှာ Record သွားဆောက်မယ်
      setStatus("Saving to Database...");
      await pb.collection("payment_requests").create({
        user: pb.authStore.model?.id,      // User ID
        username: pb.authStore.model?.name || pb.authStore.model?.username, // User Name
        email: pb.authStore.model?.email,  // User Email
        transaction_id: transactionId,     // Trans ID
        screenshot_url: imageUrl,          // ImgBB Link
        status: "pending",                 // စစ်ဆေးဆဲအဆင့်
      });

      // 3️⃣ Telegram ဆီ အကြောင်းကြားစာပို့မယ်
      setStatus("Notifying Admin...");
      const message = `
🌟 **VIP Subscription Request** 🌟
━━━━━━━━━━━━━━━━━━
👤 User: ${pb.authStore.model?.name || "Unknown"}
📧 Email: ${pb.authStore.model?.email}
🧾 Trans ID: ${transactionId}
🖼️ Proof: ${imageUrl}
━━━━━━━━━━━━━━━━━━`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      setStatus("Success!");
      alert("အောင်မြင်ပါတယ် admin ကို အကြောင်းကြားပေးလိုက်ပြီ။ စစ်ဆေးပြီး VIPဖွင့်ပေးပါမယ်။ ကျေးဇူးတင်ပါတယ်!");
    } catch (error) {
      console.error(error);
      alert("အမှားအယွင်းတစ်ခု ရှိသွားပါတယ် ။ ပြန်လည်ကြိုးစားပါ။");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051139] text-white p-6 pb-24">
      {/* 🔙 Header */}
      <div className="flex items-center mb-8">
        <Link href="/profile" className="p-2 bg-white/5 rounded-full mr-4"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={3}/></svg></Link>
        <h1 className="text-xl font-black uppercase tracking-widest">Get VIP Access</h1>
      </div>

      {/* ⭐ VIP Benefits */}
      <div className="bg-white/5 border border-yellow-500/30 rounded-3xl p-6 mb-8 backdrop-blur-md">
        <h2 className="text-yellow-500 font-black mb-4 flex items-center gap-2">🌟 VIP BENEFITS</h2>
        <ul className="space-y-3 text-sm text-gray-300 font-medium">
          <li>🎬 Unlimited Premium Shorts</li>
          <li>📖 Unlock All Manga Chapters</li>
          <li>🚫 No Ads Experience</li>
          <li>💎 Access Exclusive Novels</li>
        </ul>
      </div>

      {/* 💎 Pricing Plans */}
      <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4 ml-2">Pricing Plans</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "1 Month", price: "3,000 Ks" },
          { label: "2 Months", price: "5,000 Ks" },
          { label: "6 Months", price: "15,000 Ks" },
          { label: "1 Year", price: "30,000 Ks" }
        ].map((plan, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase">{plan.label}</p>
            <p className="text-yellow-500 font-black text-lg mt-1">{plan.price}</p>
          </div>
        ))}
      </div>

      {/* 💳 Payment Method */}
      <p className="text-xs text-blue-400 font-bold mb-4 uppercase">Payment Methods</p>
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 mb-8">
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">KPay, AYA, UAB (Hsu Myat Noe Khin)</p>
            <p className="text-xl font-black text-blue-400 mt-1">09793200264</p>
            
          </div>
          <button 
            onClick={() => handleCopy("09793200264")}
            className={`p-3 rounded-2xl transition-all active:scale-90 ${copyStatus === "09793200264" ? 'bg-green-500 text-white' : 'bg-white/5 text-yellow-500'}`}
          >
            {copyStatus === "09793200264" ? (
              <span className="text-[10px] font-bold">COPIED!</span>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3zM5 8v12h8V8H5z"/></svg>
            )}
          </button>
        </div>
      </div>
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 mb-8">
        
        <div className="flex items-center justify-between">
          <div>
          
            <p className="font-bold text-sm">KPay, AYA, UAB, Wave (Myo Si Thu)</p>
            <p className="text-xl font-black text-blue-400 mt-1">09977228155</p>
          </div>
          <button 
            onClick={() => handleCopy("09977228155")}
            className={`p-3 rounded-2xl transition-all active:scale-90 ${copyStatus === "09977228155" ? 'bg-green-500 text-white' : 'bg-white/5 text-yellow-500'}`}
          >
            {copyStatus === "09977228155" ? (
              <span className="text-[10px] font-bold">COPIED!</span>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3zM5 8v12h8V8H5z"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* 📤 Submit Payment */}
      <div className="space-y-6">
        <p className="text-sm font-black uppercase text-gray-400">Submit Payment</p>
        
        {/* Upload Box */}
        <div onClick={() => document.getElementById('file-upload')?.click()} className="aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="text-4xl mb-2">🖼️</span>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tap to upload Screenshot</p>
            </>
          )}
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </div>

        {/* Transaction ID */}
        <input 
          type="text" 
          placeholder="Enter Last 6 Digits of Trans ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
        />

        {/* Confirm Button */}
        
<button 
  onClick={handleSubmit}
  disabled={loading} // Loading ဖြစ်နေချိန်ပဲ ပိတ်ထားမယ်
  className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl bg-green-600 hover:bg-green-500 shadow-green-600/20 disabled:opacity-50 text-white`}
>
  {loading ? status : "Confirm Payment"}
</button>
      </div>
    </div>
  );
}
"use client";

import { pb } from "@/lib/pocketbase";
import { useState } from "react";
import Link from "next/link";

export default function PasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🚀 PocketBase ကနေ Password Reset Email ပို့ပေးမယ်
      await pb.collection("users").requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError("Email ပို့လို့မရပါဘူး။ အီးမေးလ်မှန်မမှန် ပြန်စစ်ပေးပါဦး။");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051139] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10">
        
        <div className="text-center mb-10">
          <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Reset Password</h1>
          <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest">RecapBox Security</p>
        </div>

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-6">
            {error && <div className="text-red-500 text-xs text-center font-bold">{error}</div>}
            
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Registered Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ကိုရိုက်ထည့်ပါ"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-500/20 border border-green-500/20 text-green-400 p-4 rounded-2xl text-sm font-bold">
              Password ချိန်းဖို့ Link ကို Email ဆီ ပို့လိုက်ပါပြီရှင့်! 📧
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Email ထဲက Link ကို နှိပ်ပြီး Password အသစ်ကို ချိန်းပေးပါနော်။
            </p>
            <Link href="/profile" className="block w-full py-4 bg-white/10 rounded-2xl font-black uppercase text-sm">
              Back to Profile
            </Link>
          </div>
        )}

        {!sent && (
          <Link href="/profile" className="block text-center mt-6 text-gray-500 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest">
            Cancel and Back
          </Link>
        )}
      </div>
    </div>
  );
}
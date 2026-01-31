"use client";

import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const authData = await pb.collection("users").authWithPassword(email, password);

      // 🔥 MAGIC FIX: path: '/' ကို ထည့်ပေးလိုက်မှ တစ်ဆိုက်လုံး Cookie ကို ဖတ်လို့ရမှာပါ
      const cookieString = pb.authStore.exportToCookie({ 
        httpOnly: false, 
        path: '/', // ⚠️ ဒါလေး လိုနေတာပါ ကိုကို
        secure: false 
      });
      
      // Cookie ကို Browser မှာ အတင်းရိုက်ထည့်မယ်
      document.cookie = cookieString;

      // Double check: ရိုးရိုး string နဲ့လည်း ထပ်ထည့်မယ် (သေချာအောင်လို့)
      document.cookie = `pb_auth=${pb.authStore.token}; path=/; max-age=86400`;

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Login Error:", err);
      setError("Email သို့မဟုတ် Password မှားယွင်းနေပါတယ်");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#051139] px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic">Welcome Back</h1>
          <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Login to RecapBox</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl text-center font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-2 block tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-2 block tracking-widest">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm font-medium">
            Don't have an account? <Link href="/register" className="text-blue-400 font-black hover:underline ml-1">Create One</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
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
      // ၁။ အရင်ဆုံး ID/Password နဲ့ စစ်မယ်
      const authData = await pb.collection("users").authWithPassword(email, password);
      const user = authData.record;

      // 📱 ၂။ Device Limit စစ်တဲ့အပိုင်း (Magic Start Here ✨)
      // Persistent random device ID stored in localStorage
      function getDeviceId(): string {
        const key = 'recapbox_device_id';
        try {
          let deviceId = localStorage.getItem(key);
          if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem(key, deviceId);
          }
          return deviceId;
        } catch {
          return crypto.randomUUID();
        }
      }
      const currentDeviceId = getDeviceId();
      let devices = user.device_ids || [];

      // ဒီ Device က စာရင်းထဲမှာ ရှိပြီးသားလား?
      const isAlreadyRegistered = devices.includes(currentDeviceId);

      if (!isAlreadyRegistered) {
        // စာရင်းထဲမရှိရင် ၂ ခု ပြည့်နေလား စစ်မယ်
        if (devices.length >= 2) {
          // ပြည့်နေရင် Logout ပြန်လုပ်ပြီး Error ပြမယ်
          pb.authStore.clear();
          setError("Device ၂ လုံးထက်ပိုသုံးလို့မရပါဘူး။ Admin ထံ ဆက်သွယ်ပါ။");
          setLoading(false);
          return;
        }

        // ၂ ခုမပြည့်သေးရင် စာရင်းထဲအသစ်ထည့်ပြီး DB မှာ Update လုပ်မယ်
        const updatedDevices = [...devices, currentDeviceId];
        await pb.collection("users").update(user.id, {
          device_ids: updatedDevices
        });
      }

      // 🔥 ၃။ အောင်မြင်ရင် Cookie သတ်မှတ်မယ် (ကုဒ်အတိုင်း)
      const cookieString = pb.authStore.exportToCookie({ 
        httpOnly: false, 
        path: '/', 
        secure: true,
        sameSite: 'Lax'
      });
      document.cookie = cookieString;
      document.cookie = `pb_auth=${pb.authStore.token}; path=/; max-age=86400; secure; SameSite=Lax`;

      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Login Error:", err);
      // PocketBase ကလာတဲ့ error message ဒါမှမဟုတ် message ပြမယ်
      setError(err.message === "Failed to authenticate." ? "Email သို့မဟုတ် Password မှားယွင်းနေပါတယ်" : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#051139] px-4 relative overflow-hidden">
      {/* Background Glows ( Design အတိုင်း) */}
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
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] p-4 rounded-2xl text-center font-bold">
              ⚠️ {error}
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
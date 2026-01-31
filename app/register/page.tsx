"use client";

import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", passwordConfirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🚀 Create User in PocketBase
      await pb.collection("users").create({
        ...formData,
        emailVisibility: true,
      });
      // 🔑 Create ပြီးရင် တစ်ခါတည်း Login ဝင်ပေးလိုက်မယ်
      await pb.collection("users").authWithPassword(formData.email, formData.password);
      router.push("/"); 
      router.refresh();
    } catch (err: any) {
      setError("အကောင့်ဖွင့်ရာတွင် အမှားအယွင်းရှိနေပါသည် ကိုကို");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-2 uppercase italic">Join Us</h1>
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Create RecapBox Account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="text-red-500 text-xs text-center font-bold">{error}</div>}
          
          <input 
            type="text" 
            placeholder="Username"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input 
            type="email" 
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Confirm Password"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
            required
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-400 text-sm font-medium hover:text-white transition-colors">
            Already have an account? <span className="text-blue-400 font-black">Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

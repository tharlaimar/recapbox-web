"use client";

import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 🖼️ ကိုကိုပေးထားတဲ့ Avatar Link များ (အသစ်ထည့်ထားသည်)
const AVATAR_LIST = [
  "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  "https://cdn-icons-png.flaticon.com/512/4140/4140047.png",
  "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
  "https://cdn-icons-png.flaticon.com/512/4140/4140051.png",
  "https://cdn-icons-png.flaticon.com/512/4128/4128176.png",
  "https://cdn-icons-png.flaticon.com/512/4128/4128335.png",
  "https://cdn-icons-png.flaticon.com/512/1999/1999625.png",
  "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
  "https://cdn-icons-png.flaticon.com/512/4333/4333609.png",
  "https://api.dicebear.com/9.x/adventurer/png?seed=Koko",
  "https://api.dicebear.com/9.x/adventurer/png?seed=ThaeThae",
  "https://api.dicebear.com/9.x/adventurer/png?seed=Hero",
  "https://api.dicebear.com/9.x/adventurer/png?seed=Princess",
  "https://api.dicebear.com/9.x/adventurer/png?seed=Warrior",
  "https://api.dicebear.com/9.x/adventurer/png?seed=Mage",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Felix",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Aneka",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Zack",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Lilly",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Leo",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Bella",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Max",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Zoe",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Jack",
  "https://api.dicebear.com/9.x/avataaars/png?seed=Mila",
  "https://api.dicebear.com/9.x/pixel-art/png?seed=Gamer",
  "https://api.dicebear.com/9.x/lorelei/png?seed=Happy",
  "https://api.dicebear.com/9.x/lorelei/png?seed=Cool",
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Modal State များ (အသစ်ထည့်ထားသည်)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [updating, setUpdating] = useState(false);

  // 🔄 VIP Status Logic (ကိုကို့ မူရင်းကုဒ်အတိုင်း)
  const fetchFreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.model?.id) {
      try {
        const freshUser = await pb.collection("users").getOne(pb.authStore.model.id, {
          requestKey: null,
          // @ts-ignore
          "t": new Date().getTime(),
        });
        
        if (freshUser.is_vip && freshUser.vip_expiry_date) {
           const now = new Date();
           const expireDate = new Date(freshUser.vip_expiry_date);
           if (now > expireDate) {
             await pb.collection("users").update(freshUser.id, { is_vip: false });
             freshUser.is_vip = false;
           }
        }
        
        setUser(freshUser);
        setNewName(freshUser.name || ""); // Name input အတွက် initial value
      } catch (err) {
        console.error("User sync error:", err);
      }
    } else {
       router.push("/");
    }
  };

  useEffect(() => {
    fetchFreshUser();
    if (pb.authStore.model?.id) {
        pb.collection("users").subscribe(pb.authStore.model.id, (e) => {
            fetchFreshUser();
        });
    }
    return () => {
        if (pb.authStore.model?.id) {
            pb.collection("users").unsubscribe(pb.authStore.model.id);
        }
    };
  }, [router]);

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
    router.refresh();
  };

  // 🖼️ Avatar Update Function (အသစ်)
  const handleUpdateAvatar = async (url: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      await pb.collection("users").update(user.id, { photoURL: url });
      await fetchFreshUser(); // Data ပြန်ဆွဲ
      setIsAvatarModalOpen(false);
    } catch (e) {
      console.error("Avatar Update Error:", e);
      alert("Failed to update avatar.");
    } finally {
      setUpdating(false);
    }
  };

  // 📝 Name Update Function (အသစ်)
  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    setUpdating(true);
    try {
      await pb.collection("users").update(user.id, { name: newName });
      await fetchFreshUser(); // Data ပြန်ဆွဲ
      setIsNameModalOpen(false);
    } catch (e) {
      console.error("Name Update Error:", e);
      alert("Failed to update name.");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-[#051139] flex items-center justify-center text-blue-500 font-bold animate-pulse">Syncing Profile...</div>;

  return (
    <div className="min-h-screen bg-[#051139] text-white p-6 pb-24 relative overflow-x-hidden">
      
      {/* 🔙 Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <Link href="/" className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={3}/></svg>
        </Link>
        <h1 className="text-lg font-black uppercase tracking-widest text-white/90">My Profile</h1>
        <div className="w-9 h-9 flex items-center justify-center">
          {user.is_vip && <span className="text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,1)] animate-pulse">👑</span>}
        </div>
      </div>

      {/* 👤 Profile Section */}
      <div className="flex flex-col items-center mb-8 relative z-20">
        <div className="relative w-32 h-32 mb-4 group">
          <div className={`w-full h-full rounded-full p-1 transition-all duration-500 ${user.is_vip ? 'bg-gradient-to-tr from-yellow-600 via-yellow-300 to-yellow-600 shadow-lg shadow-yellow-500/20' : 'bg-gray-700'}`}>
            <div className="w-full h-full rounded-full bg-[#051139] p-1 overflow-hidden relative">
               {/* photoURL ကို ဦးစားပေးပြမယ် */}
               <img 
                 src={user.photoURL || (user.avatar ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}` : "/default-avatar.png")} 
                 className="w-full h-full object-cover" 
                 alt="Profile" 
               />
            </div>
          </div>
          
          {/* 📸 Camera Icon (Modal ဖွင့်ရန် ပြင်ထားသည်) */}
          <button 
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full border-4 border-[#051139] z-30 shadow-xl active:scale-90 transition-transform"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"/></svg>
          </button>
          
          {user.is_vip && (
            <div className="absolute -top-3 -right-3 bg-[#051139] rounded-full p-1.5 border border-yellow-500 shadow-lg z-30 transform hover:scale-110 transition-transform">
              <span className="text-lg">👑</span>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-black">{user.name || user.username}</h2>
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">{user.email}</p>
        <div className="bg-[#1a2a47] px-4 py-1.5 rounded-full mt-3 border border-white/5"><span className="text-[10px] font-bold text-gray-500 tracking-wider">ID: {user.id}</span></div>
      </div>

      {/* 👑 VIP Membership Card (Logic မထိထားပါ) */}
      {user.is_vip ? (
        <div className="w-full max-w-sm mx-auto flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-8 shadow-lg shadow-orange-600/20 active:scale-[0.98] transition-transform border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <span className="text-xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">👑</span>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm uppercase tracking-widest italic text-shadow-sm">VIP Member</span>
              <span className="text-white/80 text-[10px] font-bold">EXPIRES: {user.vip_expiry_date ? new Date(user.vip_expiry_date).toLocaleDateString() : 'Lifetime'}</span>
            </div>
          </div>
          <div className="bg-black/20 px-3 py-1 rounded-lg border border-white/10 relative z-10">
            <span className="text-[9px] font-black text-white/90 uppercase tracking-wider">Active</span>
          </div>
        </div>
      ) : (
        <Link href="/vip" className="w-full max-w-sm mx-auto flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 hover:bg-white/10 transition-all border-dashed group active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <span className="text-xl opacity-50 grayscale group-hover:grayscale-0 transition-all">💎</span>
            <span className="text-gray-400 group-hover:text-white font-bold text-sm uppercase tracking-widest transition-colors">Upgrade to VIP</span>
          </div>
          <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      )}

      {/* ⚙️ Menu Sections (Function တွေ ချိတ်ပြီး) */}
      <div className="space-y-6 max-w-sm mx-auto">
        <div>
          <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2 opacity-60">Activity</h4>
          {/* 🔥 isComingSoon={true} ထည့်လိုက်ရင် နှိပ်မရတော့ဘူး */}
          <MenuItem icon="💰" title="Coin History" href="#" isComingSoon={true} />
        </div>
        <div>
          <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2 opacity-60">General</h4>
          <div className="space-y-1">
            {/* Change Name ကို Button ပြောင်းပြီး Modal ဖွင့်ခိုင်းမယ် */}
            <button onClick={() => setIsNameModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-[#1a2a47]/60 backdrop-blur-md hover:bg-white/10 transition-all rounded-2xl border border-white/5 group mb-2 active:scale-[0.98]">
               <div className="flex items-center gap-4">
                 <span className="text-lg bg-blue-500/10 p-2 rounded-xl group-hover:bg-blue-500/20 transition-colors">✏️</span>
                 <span className="text-gray-200 font-bold text-sm group-hover:text-white transition-colors">Change Name</span>
               </div>
               <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            
            <MenuItem icon="🔐" title="Change Password" href="/profile/password" />
            {!user.is_vip && <MenuItem icon="⭐" title="Buy VIP Membership" href="/vip" />}
            
            {/* Support Link (Messenger) */}
            <a href="https://m.me/recapbox26/" target="_blank" className="flex items-center justify-between p-4 bg-[#1a2a47]/60 backdrop-blur-md hover:bg-white/10 transition-all rounded-2xl border border-white/5 group mb-2 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <span className="text-lg bg-blue-500/10 p-2 rounded-xl group-hover:bg-blue-500/20 transition-colors">💬</span>
                <span className="text-gray-200 font-bold text-sm group-hover:text-white transition-colors">Support</span>
              </div>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            
            <MenuItem icon="📱" title="About App" href="/about" />
          </div>
        </div>
        <button onClick={handleLogout} className="w-full py-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-red-500/20">Log Out</button>
      </div>

      {/* ————————————— MODALS ————————————— */}

      {/* 🖼️ Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#112240] w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-white">Choose Avatar</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="p-1 bg-white/10 rounded-full">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            
            {/* Grid Images */}
            <div className="grid grid-cols-4 gap-3 h-[400px] overflow-y-auto custom-scrollbar p-1">
              {AVATAR_LIST.map((url, index) => (
                <button 
                  key={index} 
                  onClick={() => handleUpdateAvatar(url)}
                  disabled={updating}
                  className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 active:scale-95 transition-all bg-[#051139]"
                >
                  <img src={url} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📝 Name Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#112240] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
             <h3 className="text-lg font-black text-white mb-2">Change Name</h3>
             <input 
               type="text" 
               value={newName}
               onChange={(e) => setNewName(e.target.value)}
               placeholder="Enter name..."
               className="w-full bg-[#051139] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none mb-4"
             />
             <div className="flex gap-3">
               <button onClick={() => setIsNameModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold bg-white/5 text-gray-300 hover:bg-white/10">Cancel</button>
               <button onClick={handleUpdateName} disabled={updating || !newName.trim()} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50">{updating ? "Saving..." : "Save"}</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MenuItem({ icon, title, href, isComingSoon }: { icon: string; title: string; href: string; isComingSoon?: boolean }) {
  const commonClasses = "flex items-center justify-between p-4 rounded-2xl border border-white/5 mb-2 transition-all";

  // ၁။ Coming Soon ဖြစ်နေရင် နှိပ်မရ (div)
  if (isComingSoon) {
    return (
      <div className={`${commonClasses} bg-[#1a2a47]/30 opacity-50 cursor-not-allowed`}>
        <div className="flex items-center gap-4">
          <span className="text-lg bg-gray-500/10 p-2 rounded-xl grayscale">{icon}</span>
          <span className="text-gray-400 font-bold text-sm">{title}</span>
        </div>
        <span className="text-[9px] font-black bg-white/10 text-gray-400 px-2 py-1 rounded-md uppercase tracking-wider">Soon</span>
      </div>
    );
  }
  return (
    <Link href={href} className={`flex items-center justify-between p-4 bg-[#1a2a47]/60 backdrop-blur-md hover:bg-white/10 transition-all rounded-2xl border border-white/5 group mb-2 active:scale-[0.98] ${isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-center gap-4">
        <span className="text-lg bg-blue-500/10 p-2 rounded-xl group-hover:bg-blue-500/20 transition-colors">{icon}</span>
        <span className="text-gray-200 font-bold text-sm group-hover:text-white transition-colors">{title}</span>
      </div>
      <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </Link>
  );
}
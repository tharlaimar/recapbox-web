import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import CommentSection from "../../components/CommentSection";

export const dynamic = "force-dynamic";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const collectionName = "videos"; // Collection နာမည်

  const record = await pb.collection(collectionName).getOne(id);
  const youtubeVideoId = record.video_id || record.url;
  const safeVideoId = youtubeVideoId?.replace(/[^a-zA-Z0-9_-]/g, '') || '';

  return (
    <main className="min-h-screen bg-[#051139] text-white flex flex-col items-center pb-32"> 
      {/* pb-32 က အောက်က Input Bar နဲ့ မထပ်အောင်ပါ */}
      
      {/* Navbar */}
      <div className="w-full p-4 flex items-center bg-[#051139]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7 7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="font-bold">Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-4xl mt-6 p-4">
        {/* Player Container */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black ring-1 ring-white/10 z-10">
          <iframe
            src={`https://www.youtube.com/embed/${safeVideoId}?autoplay=1&rel=0`}
            title={record.title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-[#0a192f] rounded-2xl border border-white/5">
          <h1 className="text-2xl font-black text-white mb-2">{record.title}</h1>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-6">Recap • {record.created ? new Date(record.created).getFullYear() : "2024"}</p>
          
          {/* 🔥 Telegram Logic Update: Link ရှိမှသာ ပြမယ် */}
          {record.telegram_url && (
            <div className="w-full mt-4">
              <Link 
                href={record.telegram_url} 
                target="_blank"
                className="flex items-center justify-center gap-3 w-full bg-[#229ED9] hover:bg-[#1c8ec7] text-white py-4 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 group"
              >
                <svg className="w-6 h-6 fill-current group-hover:animate-bounce" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <span className="text-lg">Video အပြည့်အစုံကြည့်ရန် (Full)</span>
              </Link>
            </div>
          )}
        </div>

        {/* 💬 Comments Section */}
        <CommentSection type="video" itemId={safeVideoId} />

      </div>
    </main>
  );
}
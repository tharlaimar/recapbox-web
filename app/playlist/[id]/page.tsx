import { pb } from "@/lib/pocketbase";
import Link from "next/link";

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // ၁။ Playlist အချက်အလက်ယူမယ်
    const playlist = await pb.collection('playlists').getOne(id, {
      requestKey: null,
    });

    // ၂။ 🛠️ Multiple Relation အတွက် Filter ကို ပြင်လိုက်ပြီ
    // playlist field က Multiple ဖြစ်နေရင် ~ (contains) ကို သုံးရပါတယ်
    const videos = await pb.collection('videos').getFullList({
      filter: `playlist ~ "${id}"`, 
      sort: '-created',
      requestKey: null,
    });

    return (
      <main className="min-h-screen bg-[#051139] text-white pb-24">
        {/* Playlist Header Section */}
        <div className="relative p-6 bg-gradient-to-b from-blue-600/20 to-[#051139] border-b border-white/5">
          <Link href="/" className="mb-4 inline-block text-gray-400">
            <span className="flex items-center gap-1 text-sm">← Back</span>
          </Link>
          
          <div className="flex gap-5 items-end">
            <div className="relative w-32 aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
               <img 
                 src={playlist.thumbnail || `https://img.youtube.com/vi/${playlist.playlist_id}/hqdefault.jpg`} 
                 className="w-full h-full object-cover" 
               />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black leading-tight">{playlist.title}</h1>
              <p className="text-blue-400 text-xs font-bold mt-2 uppercase tracking-widest">
                {videos.length} Videos • Playlist
              </p>
            </div>
          </div>
        </div>

        {/* Video List Section */}
        <div className="p-4 space-y-5">
          {videos && videos.length > 0 ? videos.map((video, index) => {
            const ytId = video.video_id || video.url;
            return (
              <Link href={`/watch/${video.id}`} key={video.id} className="flex gap-4 items-center group active:scale-[0.98] transition-transform">
                <span className="text-gray-500 font-bold text-xs w-5">{index + 1}</span>
                <div className="relative w-28 aspect-video rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                  <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-bold line-clamp-2 leading-tight group-hover:text-blue-400 transition">
                    {video.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1">{video.duration || "00:00"}</p>
                </div>
              </Link>
            );
          }) : (
            <div className="text-center py-24 px-10">
               <div className="bg-white/5 p-8 rounded-3xl border border-white/5 inline-block">
                  <p className="text-gray-400 text-sm">ဗီဒီယိုတွေ တက်မလာသေးဘူး</p>
                  <p className="text-[9px] text-gray-600 mt-3 uppercase tracking-widest italic">
                    Query: playlist ~ "{id}"
                  </p>
               </div>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    return <div className="p-10 text-center text-red-400">PocketBase Connection Error</div>;
  }
}
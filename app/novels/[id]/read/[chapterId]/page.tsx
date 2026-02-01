import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";
import NovelReaderTracker from "@/app/components/NovelReaderTracker"; 
import PageTracker from "../../../../components/PageTracker"; 

export default async function NovelReader({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params; // 👈 ဒီ chapterId က URL ကလာတဲ့ ID အစစ်ပါ

  // 1. Chapter Data ယူမယ်
  const chapter = await pb.collection('novel_chapters').getOne(chapterId);

  // 2. PDF URL
  const pdfFullUrl = `${R2_DOMAIN}/${chapter.collectionId}/${chapter.id}/${chapter.pdf_url}`;

  // 🔥 Google Docs Viewer URL (iOS မှာ PDF အကုန်မြင်ရအောင်)
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfFullUrl)}&embedded=true`;

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      
      {/* 🔥 Tracker ဆီကို Title မဟုတ်ဘဲ ID အစစ်ကိုပဲ ပို့မယ် */}
      <NovelReaderTracker 
        novelId={id} 
        chapterId={chapterId} 
      />

      {/* Top Bar */}
      <div className="w-full bg-[#0f0f0f] p-4 sticky top-0 z-50 border-b border-gray-800 flex justify-between items-center">
        <Link href={`/novels/${id}`} className="text-gray-300 hover:text-white flex items-center gap-2">
          <span className="text-xl">←</span> <span className="text-xs font-bold">Back</span>
        </Link>
        <h1 className="text-[10px] font-black truncate max-w-[150px] text-yellow-500 uppercase tracking-widest">
          {chapter.title}
        </h1>
        
        {/* 🔥 Page Tracker မှာလည်း ID အစစ်ကိုပဲ သုံးမယ် */}
        <PageTracker novelId={id} chapterId={chapterId} />
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 w-full bg-black relative overflow-auto">
        {chapter.pdf_url ? (
          <div className="w-full h-full flex flex-col">
            {/* 🔥 iOS/Mobile အတွက် ပိုကောင်းအောင် iframe ကုဒ်ကို ပြင်ထားပါတယ် */}
            <iframe
              src={googleViewerUrl} 
              className="w-full flex-1 border-none shadow-2xl"
              style={{ minHeight: 'calc(100vh - 64px)' }}
              title={chapter.title}
              allow="fullscreen"
            />
            
            {/* 💡 တကယ်လို့ iframe နဲ့ ကြည့်ရတာ အဆင်မပြေတဲ့ User တွေအတွက် Download button လေးပါ ထည့်ပေးထားမယ် */}
            <div className="p-2 bg-black/50 text-center">
                <a 
                  href={pdfFullUrl} 
                  target="_blank" 
                  className="text-[10px] text-blue-400 font-bold uppercase underline"
                >
                  Open Direct PDF (If can't scroll)
                </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500 font-bold">PDF not found.</div>
        )}
      </div>
    </main>
  );
}
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
      <div className="flex-1 w-full flex justify-center bg-black overflow-hidden relative">
        {chapter.pdf_url ? (
          <iframe
            src={`${pdfFullUrl}#view=FitH`} 
            className="w-full max-w-5xl h-[calc(100vh-64px)] border-none"
            title={chapter.title}
          />
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">PDF not found.</div>
        )}
      </div>
    </main>
  );
}
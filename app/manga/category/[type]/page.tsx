import { pb, R2_DOMAIN } from "@/lib/pocketbase";
import Link from "next/link";


export default async function CategoryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const decodedType = decodeURIComponent(type);

  // 1. PocketBase Data Fetching
  let records;
  if (decodedType === "Popular") {
    records = await pb.collection('manga').getList(1, 100, {
      sort: '-created',
      requestKey: null,
    });
  } else {
    records = await pb.collection('manga').getList(1, 100, {
      filter: `type = "${decodedType}"`, 
      sort: '-created',
      requestKey: null,
    });
  }

  return (
    // ⚠️ ⚠️ main tag နေရာမှာ div ပြောင်းလိုက်လို့ layout.tsx နဲ့ ထပ်မနေတော့ဘူးနော်
    <div className="min-h-screen bg-transparent text-white p-4 pb-24">
      {/* 🔙 Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/manga" 
          className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-blue-600 transition-all shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{decodedType}</h1>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{records.totalItems} Titles Found</p>
        </div>
      </div>

      {/* 🖼️ Grid Display - Home Style အတိုင်း ဆိုဒ်ညှိထားတယ် */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {records.items.length > 0 ? (
          records.items.map((manga) => (
            <Link 
              key={manga.id} 
              href={`/manga/${manga.id}`} 
              className="group block active:scale-95 transition-transform"
            >
              {/* 📦 Card Container - Home ကအတိုင်း box လေးနဲ့ */}
              <div className="bg-[#0a192f]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all">
                {/* 📏 ပုံသေသတ်မှတ်ထားတဲ့ Aspect Ratio */}
                <div className="relative aspect-[3/4]">
                  <img 
                    src={`${R2_DOMAIN}/${manga.collectionId}/${manga.id}/${manga.image}`} 
                    alt={manga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Rating Badge - အကြည်ရောင် */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
                    <span className="text-[9px] font-black text-white">⭐ {manga.average_rating || "9.0"}</span>
                  </div>
                </div>
                
                {/* 📝 Info Area - ပုံရဲ့အောက်မှာပဲ ရှင်းရှင်းလင်းလင်းပြမယ် */}
                <div className="p-3">
                  <h3 className="text-[12px] font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors min-h-[32px]">
                    {manga.title}
                  </h3>
                  <p className="text-[9px] text-gray-500 mt-2 font-black uppercase tracking-tighter">
                    {manga.type}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500 font-bold uppercase tracking-widest">
            No Titles Found
          </div>
        )}
      </div>
    </div>
  );
}
import { pb } from "@/lib/pocketbase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ manga: [], novels: [], videos: [], reels: [] });

  try {
    const sanitizedQuery = query.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    // ၄ မျိုးလုံးကို ပြိုင်တူရှာမယ် (Performance ကောင်းအောင် Promise.all သုံးထားတယ်)
    const [mangaRes, novelRes, videoRes, reelRes] = await Promise.all([
      pb.collection('manga').getList(1, 10, { filter: `title ~ "${sanitizedQuery}"`, requestKey: null }),
      pb.collection('novels').getList(1, 10, { filter: `title ~ "${sanitizedQuery}"`, requestKey: null }),
      pb.collection('videos').getList(1, 10, { filter: `title ~ "${sanitizedQuery}"`, requestKey: null }),
      pb.collection('reel_series').getList(1, 10, { filter: `title ~ "${sanitizedQuery}"`, requestKey: null }),
    ]);

    return NextResponse.json({
      manga: mangaRes.items,
      novels: novelRes.items,
      videos: videoRes.items,
      reels: reelRes.items,
    });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ manga: [], novels: [], videos: [], reels: [] });
  }
}
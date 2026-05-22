import { NextResponse } from "next/server";
import { getInstagramPosts } from "@/lib/instagram";

export async function GET() {
  try {
    const posts = await getInstagramPosts();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json(
      { error: "No fue posible cargar publicaciones de Instagram." },
      { status: 502 },
    );
  }
}

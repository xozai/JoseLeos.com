import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const views = (await kv.get<number>(`views:${slug}`)) ?? 0;
  return NextResponse.json({ views });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const views = await kv.incr(`views:${slug}`);
  return NextResponse.json({ views });
}

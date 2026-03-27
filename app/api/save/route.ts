import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";

// GET /api/save?type=post&slug=hello — returns { saved: boolean }
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ saved: false });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");
  if (!type || !slug) return NextResponse.json({ saved: false });

  const key = `saves:${session.user.email}`;
  const item = `${type}:${slug}`;
  const saved = await kv.sismember(key, item);
  return NextResponse.json({ saved: !!saved });
}

// POST /api/save  body: { type, slug }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, slug } = await req.json();
  if (!type || !slug)
    return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });

  const key = `saves:${session.user.email}`;
  await kv.sadd(key, `${type}:${slug}`);
  return NextResponse.json({ saved: true });
}

// DELETE /api/save  body: { type, slug }
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, slug } = await req.json();
  if (!type || !slug)
    return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });

  const key = `saves:${session.user.email}`;
  await kv.srem(key, `${type}:${slug}`);
  return NextResponse.json({ saved: false });
}

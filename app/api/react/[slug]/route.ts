import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_EMOJIS = ["👍", "❤️", "🔥"] as const;
type Emoji = (typeof VALID_EMOJIS)[number];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();

  const counts: Record<string, number> = {};
  const userReactions: Record<string, boolean> = {};

  for (const emoji of VALID_EMOJIS) {
    const key = `reactions:${slug}:${emoji}`;
    counts[emoji] = (await kv.get<number>(key)) ?? 0;
    if (session?.user?.email) {
      const userKey = `user-reactions:${session.user.email}:${slug}`;
      userReactions[emoji] = !!(await kv.sismember(userKey, emoji));
    }
  }

  return NextResponse.json({ counts, userReactions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 30 reactions per IP per minute (toggle spam prevention)
  const limited = await checkRateLimit(req, "react", 30, 60);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const { emoji } = await req.json();
  if (!VALID_EMOJIS.includes(emoji as Emoji))
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });

  const userKey = `user-reactions:${session.user.email}:${slug}`;
  const countKey = `reactions:${slug}:${emoji}`;

  const alreadyReacted = await kv.sismember(userKey, emoji);

  if (alreadyReacted) {
    await kv.srem(userKey, emoji);
    const newCount = await kv.decr(countKey);
    return NextResponse.json({ reacted: false, count: Math.max(0, newCount) });
  } else {
    await kv.sadd(userKey, emoji);
    const newCount = await kv.incr(countKey);
    return NextResponse.json({ reacted: true, count: newCount });
  }
}

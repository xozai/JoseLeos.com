import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.ISR_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postType, slug } = body as { postType?: string; slug?: string };

    if (postType === "post" && slug) {
      revalidatePath(`/blog/${slug}`);
      revalidatePath("/blog");
    } else if (postType === "portfolioProject" && slug) {
      revalidatePath(`/portfolio/${slug}`);
      revalidatePath("/portfolio");
    } else if (postType === "recommendation") {
      revalidatePath("/recommendations");
    }

    revalidatePath("/");

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

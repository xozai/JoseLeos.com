import { auth, OWNER_EMAIL } from "@/auth";
import type { Visibility } from "@/lib/types";

export type { Visibility };

export async function canAccess(visibility: Visibility = "public"): Promise<boolean> {
  if (visibility === "public") return true;
  const session = await auth();
  if (!session?.user) return false;
  if (visibility === "members") return true;
  if (visibility === "private") return session.user.email === OWNER_EMAIL;
  return false;
}

export async function filterByAccess<
  T extends { acfVisibility?: { visibility?: Visibility } }
>(items: T[]): Promise<T[]> {
  const session = await auth();
  return items.filter((item) => {
    const v = item.acfVisibility?.visibility ?? "public";
    if (v === "public") return true;
    if (v === "members") return !!session?.user;
    if (v === "private") return session?.user?.email === OWNER_EMAIL;
    return true;
  });
}

export async function isOwner(): Promise<boolean> {
  const session = await auth();
  return session?.user?.email === OWNER_EMAIL;
}

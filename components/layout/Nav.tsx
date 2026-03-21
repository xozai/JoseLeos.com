import { auth } from "@/auth";
import NavClient from "@/components/layout/NavClient";

export default async function Nav() {
  const session = await auth();
  return <NavClient session={session} />;
}

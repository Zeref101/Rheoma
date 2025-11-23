import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "./trpc/routers/server";

// import prisma from "@/lib/db";

export default async function Home() {
  await requireAuth();
  const data = await caller.getUsers();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      Protected route  {JSON.stringify(data)}
    </div>
  );
}

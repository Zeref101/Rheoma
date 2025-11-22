import Image from "next/image";
import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import { useTRPC } from "./trpc/routers/client";
import { getQueryClient, trpc } from "./trpc/routers/server";
import Client from "./client";
import { Suspense } from "react";

export default function Home() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div>Loading...</div>}>
          <Client />
        </Suspense>
      </HydrationBoundary>

    </div>
  );
}

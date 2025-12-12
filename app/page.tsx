"use client";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "./trpc/routers/server";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "./trpc/routers/client";
import { toast } from "sonner";

// import prisma from "@/lib/db";

export default function Home() {

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: (data) => {
      console.log(data);
    }
  }));

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast.success("Job queued");
    }
  }));


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black flex-col">
      {/* Protected route  {JSON.stringify(data)} */}
      {/* {testAi.data} */}
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>test ai</Button>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
    </div>
  );
}


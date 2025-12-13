import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/app/trpc/routers/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

//* Hook to fetch all workflow using suspense
export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getMany.queryOptions());
};

// * Hook to create workflow
export const useCreateWorkflow = () => {
  const trpc = useTRPC();

  return useMutation(trpc.workflows.create.mutationOptions());
};

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/app/trpc/routers/client";
import { WorkflowsParams } from "@/types/constants";
import { useWorkflowsParams } from "./use-workflows-params";

//* Hook to fetch all workflow using suspense
export const useSuspenseWorkflows = (initialParams?: WorkflowsParams) => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  const finalParams = params;
  console.log(finalParams);
  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(finalParams));
};

// * Hook to create workflow
export const useCreateWorkflow = () => {
  const trpc = useTRPC();

  return useMutation(trpc.workflows.create.mutationOptions());
};

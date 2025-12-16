import { prefetch, trpc } from "@/app/trpc/routers/server";
import { WorkflowsParams } from "@/types/constants";

// ? prefetch all workflows
export const prefetchWorkflows = (params: WorkflowsParams) => {
  return prefetch(trpc.workflows.getMany.queryOptions(params));
};

// ? prefetch a single workflow
export const prefetchWorkflow = (id: string) => {
  return prefetch(trpc.workflows.getOne.queryOptions({ id }));
};

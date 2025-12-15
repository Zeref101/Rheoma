import { prefetch, trpc } from "@/app/trpc/routers/server";
import { WorkflowsParams } from "@/types/constants";

// ? prefetch all workflows
export const prefetchWorkflows = (params: WorkflowsParams) => {
  return prefetch(trpc.workflows.getMany.queryOptions(params));
};

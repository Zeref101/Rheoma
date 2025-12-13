import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/app/trpc/routers/server";

type Input = inferInput<typeof trpc.workflows.getMany>;

// ? prefetch all workflows
export const prefetchWorkflows = (params: Input) => {
  return prefetch(trpc.workflows.getMany.queryOptions(params));
};

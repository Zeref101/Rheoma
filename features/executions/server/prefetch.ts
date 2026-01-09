import { prefetch, trpc } from "@/app/trpc/routers/server";
import { ExecutionsParams } from "@/types/constants";

// ? prefetch all executions
export const prefetchExecutions = (params: ExecutionsParams) => {
  return prefetch(trpc.executions.getMany.queryOptions(params));
};

// ? prefetch a single execution
export const prefetchExecution = (id: string) => {
  return prefetch(trpc.executions.getOne.queryOptions({ id }));
};

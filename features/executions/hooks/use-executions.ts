import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/app/trpc/routers/client";
import { useExecutionsParams } from "./use-executions-params";

/**
 * Hook to fetch a paginated list of credentials for the authenticated user
 * using React Query Suspense.
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  const finalParams = params;
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(finalParams));
};

/**
 * Hook to fetch a single credential by ID using React Query Suspense.
 */
export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};

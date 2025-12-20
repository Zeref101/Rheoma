import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/app/trpc/routers/client";
import { useWorkflowsParams } from "./use-workflows-params";
import { toast } from "sonner";

//* Hook to fetch all workflow using suspense
export const useSuspenseWorkflows = () => {
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

// * Hook to remove a workflow
export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const QueryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} removed`);
        QueryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
    })
  );
};

//* Hook to fetch single workflow using suspense
export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
};
// * Hook to update a workflow name
export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} updated`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.workflows.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to update workflow: ${error}`);
      },
    })
  );
};
// * Hook to update a workflow
export const useUpdateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} saved`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.workflows.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to save workflow: ${error}`);
      },
    })
  );
};

// * Hook to execute a workflow
export const useExecuteWorkflow = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} executed`);
      },
      onError: (error) => {
        toast.error(`Failed to execute workflow: ${error}`);
      },
    })
  );
};

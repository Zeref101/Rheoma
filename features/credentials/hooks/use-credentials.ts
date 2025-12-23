import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/app/trpc/routers/client";
import { useCredentialsParams } from "./use-credentials-params";
import { toast } from "sonner";
import { CredentialType } from "@/app/generated/prisma/enums";

/**
 * Hook to fetch a paginated list of credentials for the authenticated user
 * using React Query Suspense.
 */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  const finalParams = params;
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(finalParams));
};

/**
 * Hook to create a new credential for the authenticated user.
 */
export const useCreateCredential = () => {
  const trpc = useTRPC();

  return useMutation(trpc.credentials.create.mutationOptions());
};

/**
 * Hook to delete a credential owned by the authenticated user.
 * Invalidates the credentials list on success.
 */
export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential ${data.name} removed`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
      },
    })
  );
};

/**
 * Hook to fetch a single credential by ID using React Query Suspense.
 */
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

/**
 * Hook to update an existing credential.
 * Automatically invalidates the relevant credential queries on success.
 */
export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential ${data.name} saved`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to save Credential: ${error}`);
      },
    })
  );
};

// ? Hook to fetch all credentials by type
export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();

  return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};

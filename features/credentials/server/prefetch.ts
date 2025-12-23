import { prefetch, trpc } from "@/app/trpc/routers/server";
import { CredentialParams } from "@/types/constants";

// ? prefetch all credentials
export const prefetchCredentials = (params: CredentialParams) => {
  return prefetch(trpc.credentials.getMany.queryOptions(params));
};

// ? prefetch a single credential
export const prefetchCredential = (id: string) => {
  return prefetch(trpc.credentials.getOne.queryOptions({ id }));
};

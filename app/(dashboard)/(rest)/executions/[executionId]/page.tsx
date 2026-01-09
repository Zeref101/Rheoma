import { HydrateClient } from "@/app/trpc/routers/server";
import { ExecutionView } from "@/features/integrations/components/execution";
import { ExecutionsError, ExecutionsLoading } from "@/features/integrations/components/executions";
import { requireAuth } from "@/lib/auth-utils";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ executionId: string }>;
}

const Page = async ({ params }: Props) => {
  await requireAuth();
  const { executionId } = await params;
  return (
    <div className="h-full p-4 md:px-10 md:py-6">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-y-8">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;

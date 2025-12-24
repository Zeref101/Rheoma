import { HydrateClient } from "@/app/trpc/routers/server";
import { ExecutionView } from "@/features/executions/components/execution";
import { ExecutionsError, ExecutionsLoading } from "@/features/executions/components/executions";
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
    <div className='p-4 md:px-10 md:py-6 h-full'>
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
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

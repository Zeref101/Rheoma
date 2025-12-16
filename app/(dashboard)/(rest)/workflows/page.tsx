import { HydrateClient } from '@/app/trpc/routers/server';
import { prefetchWorkflows } from '@/features/workflows/server/prefetch';
import { requireAuth } from '@/lib/auth-utils'
import { ErrorBoundary } from 'react-error-boundary';
import React, { Suspense } from 'react'
import { WorkflowsContainer, WorkflowsError, WorkflowsList, WorkflowsLoading } from '@/components/workflows';
import { workflowsParamsLoader } from '@/features/workflows/server/params-loader';
import { SearchProps } from '@/types/constants';

const page = async ({ searchParams }: SearchProps) => {
    await requireAuth();

    const params = await workflowsParamsLoader(searchParams);
    // console.log(params.page + "OIASjdoajdoajoa");
    prefetchWorkflows(params);
    return (
        <WorkflowsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<WorkflowsError />}>
                    <Suspense fallback={<WorkflowsLoading />}>
                        <WorkflowsList initialParams={params} />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </WorkflowsContainer>
    )
}

export default page

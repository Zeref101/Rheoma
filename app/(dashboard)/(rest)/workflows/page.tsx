import { HydrateClient } from '@/app/trpc/routers/server';
import { prefetchWorkflows } from '@/features/workflows/server/prefetch';
import { requireAuth } from '@/lib/auth-utils'
import { ErrorBoundary } from 'react-error-boundary';
import React, { Suspense } from 'react'
import { WorkflowsContainer, WorkflowsList } from '@/components/workflows';

const page = async () => {
    await requireAuth();

    prefetchWorkflows();
    return (
        <WorkflowsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error</p>}>
                    <Suspense fallback={<p>Loading...</p>}>
                        <WorkflowsList />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </WorkflowsContainer>
    )
}

export default page

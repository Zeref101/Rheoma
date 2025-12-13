"use client";
import { useCreateWorkflow, useSuspenseWorkflows } from '@/features/workflows/hooks/use-workflows'
import React from 'react'
import { boolean } from 'zod';
import { EntityContainer, EntityHeader } from './entity-components';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/app/trpc/routers/client';

export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();
    return (
        <div className='flex-1 flex justify-center items-center'>
            {JSON.stringify(workflows.data, null, 2)};
        </div>
    )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const createWorkflow = useCreateWorkflow();
    const router = useRouter();
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" created`);
                router.push(`/workflows/${data.id}`);
                queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions());
            },
            onError: (error) => {
                console.log(error);
            }
        })
    }
    return (
        <>
            <EntityHeader
                title='Workflows'
                description='Create and manage your workflows'
                onNew={handleCreate}
                newButtonLabel='New Workflow'
                disabled={disabled}
                isCreating={createWorkflow.isPending}
            />
        </>
    )
}

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkflowsHeader />}
            search={<></>}
            pagination={<></>}>
            {children}
        </EntityContainer>
    )
}
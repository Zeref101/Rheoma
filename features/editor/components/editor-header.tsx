"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIcon } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    useSuspenseWorkflow,
    useUpdateWorkflowName,
} from "@/features/workflows/hooks/use-workflows";

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
    return (
        <div className="ml-auto">
            <Button size="sm" onClick={() => { }} disabled={false}>
                <SaveIcon className="size-4" />
                Save
            </Button>
        </div>
    );
};

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const updateWorkflow = useUpdateWorkflowName();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(workflow.name);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (workflow.name) {
            setName(workflow.name);
        }
    }, [workflow.name]);

    useEffect(() => {
        if (isEditing && input.current) {
            input.current.focus();
            input.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (name === workflow.name) {
            setIsEditing(false);
            return;
        }
        setIsEditing(false);
        try {
            await updateWorkflow.mutateAsync({
                id: workflowId,
                name,
            });
        } catch {
            setName(workflow.name);
        } finally {
            setIsEditing(false);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setName(workflow.name);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <Input
                disabled={updateWorkflow.isPending}
                ref={input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="h-7 w-auto min-w-[100px] px-2"
            />
        );
    }
    return (
        <Breadcrumb className="hover:text-foreground cursor-pointer transition-colors" onClick={() => setIsEditing(true)}>
            {workflow.name}
        </Breadcrumb>
    );
};

export const EditorBreadCrumbs = ({ workflowId }: { workflowId: string }) => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link prefetch href={"/workflows"}>
                            Workflows
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <EditorNameInput workflowId={workflowId} />
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
    return (
        <header className="bg-background flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="flex w-full flex-row items-center justify-between gap-x-4">
                <EditorBreadCrumbs workflowId={workflowId} />
                <EditorSaveButton workflowId={workflowId} />
            </div>
        </header>
    );
};

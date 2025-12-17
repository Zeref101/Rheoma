"use client";

import { type NodeProps, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useCallback } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "../../../components/react-flow/base-handle";
import { WorkflowNode } from "../../../components/workflow-node";

interface BaseTriggerNodeProps extends NodeProps {
    Icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    // staus?: NodeStatus;
    onSetting?: () => void;
    onDoubleClick?: () => void;
}

const BaseTriggerNodeComponent = (props: BaseTriggerNodeProps) => {
    // You can destructure props as needed
    const { id, Icon, name, description, children, onSetting, onDoubleClick } = props;
    const handleDelete = () => { };
    return (
        // ! TODO: wrap inside node status indicator wrapper
        <WorkflowNode
            name={name}
            description={description}
            onDelete={handleDelete}
            onSettings={onSetting}
        >
            <BaseNode onDoubleClick={onDoubleClick} className="group relative rounded-l-2xl">
                <BaseNodeContent>
                    {typeof Icon === "string" ? (
                        <Image src={Icon} alt={name} width={16} height={16} />
                    ) : (
                        <Icon className="text-muted-foreground size-4" />
                    )}
                    {children}
                    <BaseHandle id={"source-1"} type="source" position={Position.Right} />
                </BaseNodeContent>
            </BaseNode>
        </WorkflowNode>
    );
};

BaseTriggerNodeComponent.displayName = "BaseExecutionNode";

export const BaseTriggerNode = memo(BaseTriggerNodeComponent);

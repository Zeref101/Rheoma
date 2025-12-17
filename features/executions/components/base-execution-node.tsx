"use client";

import { type NodeProps, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useCallback } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "../../../components/react-flow/base-handle";
import { WorkflowNode } from "../../../components/workflow-node";

interface BaseExecutionNodeProps extends NodeProps {
    Icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    // staus?: NodeStatus;
    onSetting?: () => void;
    onDoubleClick?: () => void;
};

const BaseExecutionNodeComponent = (props: BaseExecutionNodeProps) => {
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
            <BaseNode onDoubleClick={onDoubleClick}>
                <BaseNodeContent>
                    {typeof Icon === "string" ? (
                        <Image src={Icon} alt={name} width={16} height={16} />
                    ) : (
                        <Icon className="size-4 text-muted-foreground" />
                    )}
                    {children}
                    <BaseHandle
                        id={"target-1"}
                        type="target"
                        position={Position.Left}
                    />
                    <BaseHandle
                        id={"source-1"}
                        type="source"
                        position={Position.Right}
                    />
                </BaseNodeContent>
            </BaseNode>
        </WorkflowNode>
    );
};

BaseExecutionNodeComponent.displayName = "BaseExecutionNode";

export const BaseExecutionNode = memo(BaseExecutionNodeComponent);
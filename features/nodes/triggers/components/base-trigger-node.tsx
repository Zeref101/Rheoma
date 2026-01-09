"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useState } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "../../../../components/react-flow/base-handle";
import { WorkflowNode } from "../../../../components/workflow-node";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
interface BaseTriggerNodeProps extends NodeProps {
  Icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSetting?: () => void;
  onDoubleClick?: () => void;
}

const BaseTriggerNodeComponent = (props: BaseTriggerNodeProps) => {
  const { id, Icon, name, description, children, onSetting, onDoubleClick, status } = props;
  const { setNodes, setEdges } = useReactFlow();
  const [openUtil, setOpenUtil] = useState(false);
  const handleDelete = () => {
    setNodes((currentNodes) => {
      const updatedNodes = currentNodes.filter((node) => node.id !== id);
      return updatedNodes;
    });
    setEdges((currentEdges) => {
      const updateEdges = currentEdges.filter((edge) => edge.source !== id && edge.target !== id);
      return updateEdges;
    });
  };
  return (
    <WorkflowNode
      name={name}
      description={description}
      onDelete={handleDelete}
      onSettings={onSetting}
      showToolbar={openUtil}
    >
      <NodeStatusIndicator status={status} variant="border" className="rounded-l-2xl">
        <BaseNode
          status={status}
          onDoubleClick={onDoubleClick}
          className="group relative rounded-l-2xl"
          onClick={() => setOpenUtil(!openUtil)}
        >
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
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};

BaseTriggerNodeComponent.displayName = "BaseExecutionNode";

export const BaseTriggerNode = memo(BaseTriggerNodeComponent);

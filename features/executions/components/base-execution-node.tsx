"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useCallback, useState } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "../../../components/react-flow/base-handle";
import { WorkflowNode } from "../../../components/workflow-node";
import {
  NodeStatusIndicator,
  type NodeStatus,
} from "@/components/react-flow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps {
  Icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSetting?: () => void;
  onDoubleClick?: () => void;
}

const BaseExecutionNodeComponent = (props: BaseExecutionNodeProps) => {
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
      <NodeStatusIndicator status={status}>
        <BaseNode
          onDoubleClick={onDoubleClick}
          onClick={() => setOpenUtil(!openUtil)}
          status={status}
        >
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="text-muted-foreground size-4" />
            )}
            {children}
            <BaseHandle id={"target-1"} type="target" position={Position.Left} />
            <BaseHandle id={"source-1"} type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};

BaseExecutionNodeComponent.displayName = "BaseExecutionNode";

export const BaseExecutionNode = memo(BaseExecutionNodeComponent);

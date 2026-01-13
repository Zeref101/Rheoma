"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { LimitDialog, LimitFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchLimitRealtimeToken } from "./actions";
import { LimitChannel } from "@/inngest/channels/limit";

type LimitMode = "first" | "last";
type LimitNodeData = {
  variableName?: string;
  limit?: number;
  sourceData?: string;
  mode?: LimitMode;
};

type LimitNodeType = Node<LimitNodeData>;

export const LimitNode = memo((props: NodeProps<LimitNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: LimitChannel().name,
    topic: "status",
    refreshToken: fetchLimitRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeData = props.data;
  const description = nodeData.limit
    ? `Keep ${nodeData.mode ?? "first"} ${nodeData.limit} item${nodeData.limit > 1 ? "s" : ""}`
    : "Not configured";

  const { setNodes } = useReactFlow();

  const handleOnSetting = () => setDialogOpen(!dialogOpen);
  const handleSubmit = (values: LimitFormValues) => {
    console.log(values);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      })
    );
  };
  return (
    <>
      <LimitDialog
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(!dialogOpen)}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        Icon={"/logos/limit.svg"}
        name="Limit"
        description={description}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
        status={nodeStatus}
      />
    </>
  );
});

LimitNode.displayName = "LimitNode";

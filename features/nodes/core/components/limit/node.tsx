"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { splitModes, SplitOutDialog, SplitOutFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchSplitOutRealtimeToken } from "./actions";
import { SplitOutChannel } from "@/inngest/channels/anthropic copy";

type SplitOutNodeData = {
  variableName?: string;
  fields?: string[];
  fieldsInput?: string;
  sourceData?: string;
  mode?: splitModes;
  keepOtherFields?: boolean;
};

type SplitOutNodeType = Node<SplitOutNodeData>;

export const LimitNode = memo((props: NodeProps<SplitOutNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SplitOutChannel().name,
    topic: "status",
    refreshToken: fetchSplitOutRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeData = props.data;
  const isConfigured = Array.isArray(nodeData?.fields) && nodeData.fields.length > 0;

  const fieldsCount = nodeData?.fields?.length ?? 0;

  const description = isConfigured
    ? nodeData?.mode === "zip"
      ? `Split ${fieldsCount} field${fieldsCount > 1 ? "s" : ""} (zip)`
      : `Split ${fieldsCount} field${fieldsCount > 1 ? "s" : ""}`
    : "Not configured";

  const { setNodes } = useReactFlow();

  const handleOnSetting = () => setDialogOpen(!dialogOpen);
  const handleSubmit = (values: SplitOutFormValues) => {
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
      <SplitOutDialog
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

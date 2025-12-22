"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGeminiRealtimeToken } from "./actions";
import { geminiChannel } from "@/inngest/channels/gemini";
import { AVAILABLE_MODELS, GeminiDialog, GeminiFormValues, GeminiModel } from "./dialog";

type GeminiNodeData = {
  model?: GeminiModel;
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: geminiChannel().name,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]} : ${nodeData.userPrompt.slice(0, 50)}`
    : `Not Configured`;
  const { setNodes } = useReactFlow();

  const handleOnSetting = () => setDialogOpen(!dialogOpen);
  const handleSubmit = (values: GeminiFormValues) => {
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
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(!dialogOpen)}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        Icon={"/logos/gemini.svg"}
        name="Gemini"
        description={description}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
        status={nodeStatus}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";

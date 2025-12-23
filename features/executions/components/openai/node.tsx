"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAiRealtimeToken } from "./actions";
import { AVAILABLE_MODELS, OpenAiDialog, OpenAiFormValues, OpenAiModel } from "./dialog";
import { openAiChannel } from "@/inngest/channels/openai";

type OpenAiNodeData = {
  credentialId?: string;
  model?: OpenAiModel;
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: openAiChannel().name,
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]} : ${nodeData.userPrompt.slice(0, 50)}`
    : `Not Configured`;
  const { setNodes } = useReactFlow();

  const handleOnSetting = () => setDialogOpen(!dialogOpen);
  const handleSubmit = (values: OpenAiFormValues) => {
    // console.log(values);
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
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(!dialogOpen)}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        Icon={"/logos/openai.svg"}
        name="OpenAI"
        description={description}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
        status={nodeStatus}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenAiNode";

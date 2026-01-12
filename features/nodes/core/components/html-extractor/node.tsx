"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { HtmlExtractorDialog, HtmlExtractorFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchHtmlExtractorRealtimeToken } from "./actions";
import { HtmlExtractorChannel } from "@/inngest/channels/html-extractor";

type HtmlExtraction = {
  key: string;
  selector: string;
  returnValue: "text" | "html" | "attribute";
  attribute?: string;
  skipSelectors?: string;
  returnArray: boolean;
};

type HtmlExtractorNodeData = {
  variableName?: string;
  sourceHtml?: string;
  extractions?: HtmlExtraction[];
};

type HtmlExtractorNodeType = Node<HtmlExtractorNodeData>;

export const HtmlExtractorNode = memo((props: NodeProps<HtmlExtractorNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HtmlExtractorChannel().name,
    topic: "status",
    refreshToken: fetchHtmlExtractorRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeData = props.data;
  const extractions = nodeData.extractions ?? [];

  const isConfigured = extractions.length > 0 && extractions.some((e) => e.key && e.selector);

  const description = isConfigured
    ? `Extract ${extractions.length} field${extractions.length > 1 ? "s" : ""}`
    : "Not Configured";

  const { setNodes } = useReactFlow();

  const handleOnSetting = () => setDialogOpen(!dialogOpen);
  const handleSubmit = (values: HtmlExtractorFormValues) => {
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
      <HtmlExtractorDialog
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(!dialogOpen)}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        Icon={"/logos/html.png"}
        name="HTML Extractor"
        description={description}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
        status={nodeStatus}
      />
    </>
  );
});

HtmlExtractorNode.displayName = "HtmlExtractorNode";

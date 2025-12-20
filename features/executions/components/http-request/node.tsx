"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { HttpRequestDialog, HttpRequestFormValues } from "./dialog";

type HttpRequestNodeData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const nodeStatus = "initial";
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeData = props.data;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : `Not Configured`;
  const { setNodes } = useReactFlow();

  const handleOnSetting = () => setDialogOpen(!dialogOpen);
  const handleSubmit = (values: HttpRequestFormValues) => {
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
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(!dialogOpen)}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        Icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
        status={nodeStatus}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";

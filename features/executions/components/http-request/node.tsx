"use client";
import type { Node, NodeProps, Position } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";

type HttpRequestNodeData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
    [key: string]: unknown
}

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
    const nodeData = props.data;
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
        : `Not Configured`
    return (
        <BaseExecutionNode
            {...props}
            id={props.id}
            Icon={GlobeIcon}
            name="HTTP Request"
            description={description}
            onSetting={() => { }}
            onDoubleClick={() => { }}
        />
    );
});

HttpRequestNode.displayName = "HttpRequestNode";
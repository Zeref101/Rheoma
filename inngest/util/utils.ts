import { Connection, Node } from "@/app/generated/prisma/client";
import toposort from "toposort";
import { inngest } from "../client";

export const topologicalSort = (nodes: Node[], connections: Connection[]): Node[] => {
  // ? if no connections -> all independent nodes
  if (connections.length === 0) {
    return nodes;
  }
  // ? create edges array for toposort
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);
  // ? Nodes with at least one connection
  const connectionNodeIds = new Set<string>();
  for (const connection of connections) {
    connectionNodeIds.add(connection.fromNodeId);
    connectionNodeIds.add(connection.toNodeId);
  }

  // ? topological sort
  let sortedNodeIds: string[] = [];
  try {
    sortedNodeIds = toposort(edges);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
  }
  const sortedSet = new Set(sortedNodeIds);
  // ?add standalone nodes goes after sorting
  for (const node of nodes) {
    if (!sortedSet.has(node.id)) {
      sortedNodeIds.push(node.id);
    }
  }
  // ? mapping  of sorted ids
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  initialData?: Record<string, unknown>;
}) => {
  return await inngest.send({
    name: "workflows/execute.workflow",
    data: {
      workflowId: data.workflowId,
      initialData: data.initialData ?? {},
    },
  });
};

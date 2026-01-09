import { Realtime } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useEffect, useState } from "react";
import { NodeStatus } from "@/components/react-flow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.Token>;
}

export function useNodeStatus({ nodeId, channel, topic, refreshToken }: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial");

  const { data } = useInngestSubscription({
    refreshToken,
    enabled: true,
  });

  useEffect(() => {
    if (!data.length) return;

    const latestMsg = data
      .filter(
        (msg) =>
          msg &&
          msg.kind === "data" &&
          msg.channel === channel &&
          msg.topic === topic &&
          msg.data?.nodeId === nodeId
      )
      .sort((a, b) => {
        if (a.kind === "data" && b.kind === "data") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      })[0];

    if (!latestMsg || latestMsg.kind !== "data") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(latestMsg.data.status as NodeStatus);
  }, [channel, data, nodeId, topic]);

  return status;
}

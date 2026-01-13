import { channel, topic } from "@inngest/realtime";

export const LIMIT_CHANNEL_NAME = "limit-execution";

export const LimitChannel = channel(LIMIT_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);

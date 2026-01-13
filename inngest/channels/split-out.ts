import { channel, topic } from "@inngest/realtime";

export const SPLIT_OUT_CHANNEL_NAME = "split-out-execution";

export const SplitOutChannel = channel(SPLIT_OUT_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);

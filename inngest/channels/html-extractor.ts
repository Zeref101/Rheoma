import { channel, topic } from "@inngest/realtime";

export const HTML_EXTRACTOR_CHANNEL_NAME = "html-extractor-execution";

export const HtmlExtractorChannel = channel(HTML_EXTRACTOR_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);

import { HtmlExtractorChannel } from "@/inngest/channels/html-extractor";
import { Realtime } from "@inngest/realtime";

type WithNodeStatusArgs<T> = {
  nodeId: string;
  publish: Realtime.PublishFn;
  channel: ReturnType<typeof HtmlExtractorChannel>;
  run: () => Promise<T>;
};

export async function withNodeStatus<T>({
  nodeId,
  publish,
  channel,
  run,
}: WithNodeStatusArgs<T>): Promise<T> {
  await publish(
    channel.status({
      nodeId,
      status: "loading",
    })
  );

  try {
    const result = await run();

    await publish(
      channel.status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      channel.status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
}

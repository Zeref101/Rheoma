import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import type { NodeExecutor } from "@/types/constants";

type StripeTriggerData = Record<string, unknown>;
export const stripeTriggerExecution: NodeExecutor<StripeTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  const result = await step.run("stripe-trigger", async () => context);
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "success",
    })
  );
  return result;
};

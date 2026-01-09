import { gmailTriggerChannel } from "@/inngest/channels/gmail-trigger";
import type { NodeExecutor } from "@/types/constants";

type GmailTriggerData = Record<string, unknown>;
export const gmailTriggerExecution: NodeExecutor<GmailTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    gmailTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  const result = await step.run("gmail-trigger", async () => context);
  await publish(
    gmailTriggerChannel().status({
      nodeId,
      status: "success",
    })
  );
  return result;
};

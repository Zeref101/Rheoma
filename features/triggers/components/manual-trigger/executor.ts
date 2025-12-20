import type { NodeExecutor } from "@/types/constants";

type ManualTriggerData = Record<string, unknown>;
export const manualTriggerExecution: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish loading state
  const result = await step.run("manual-trigger", async () => context);
  // TODO success state
  return result;
};

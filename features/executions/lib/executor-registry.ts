import { NodeType } from "@/app/generated/prisma/enums";
import { manualTriggerExecution } from "@/features/triggers/components/manual-trigger/executor";
import { NodeExecutor } from "@/types/constants";
import { httpRequestExecution } from "../components/http-request/executor";
import { googleFormTriggerExecution } from "@/features/triggers/components/google-form-trigger/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecution,
  [NodeType.INITIAL]: manualTriggerExecution,
  [NodeType.HTTP_REQUEST]: httpRequestExecution,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecution,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) throw new Error(`No executor found for node type : ${type}`);

  return executor;
};

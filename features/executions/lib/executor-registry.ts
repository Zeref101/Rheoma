import { NodeType } from "@/app/generated/prisma/enums";
import { manualTriggerExecution } from "@/features/triggers/components/manual-trigger/executor";
import { NodeExecutor } from "@/types/constants";
import { httpRequestExecution } from "../components/http-request/executor";
import { googleFormTriggerExecution } from "@/features/triggers/components/google-form-trigger/executor";
import { geminiExecution } from "../components/gemini/executor";
import { openAiExecution } from "../components/openai/executor";
import { anthropicExecution } from "../components/anthropic/executor";
import { discordExecution } from "../components/discord/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecution,
  [NodeType.INITIAL]: manualTriggerExecution,
  [NodeType.HTTP_REQUEST]: httpRequestExecution,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecution,
  [NodeType.STRIPE_TRIGGER]: googleFormTriggerExecution,
  [NodeType.GEMINI]: geminiExecution,
  [NodeType.ANTHROPIC]: anthropicExecution,
  [NodeType.OPENAI]: openAiExecution,
  [NodeType.DISCORD]: discordExecution,
  [NodeType.SLACK]: discordExecution,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) throw new Error(`No executor found for node type : ${type}`);

  return executor;
};

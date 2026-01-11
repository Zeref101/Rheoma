import { NodeType } from "@/app/generated/prisma/enums";
import { manualTriggerExecution } from "@/features/nodes/triggers/components/manual-trigger/executor";
import { NodeExecutor } from "@/types/constants";
import { googleFormTriggerExecution } from "@/features/nodes/triggers/components/google-form-trigger/executor";
import { httpRequestExecution } from "@/features/nodes/core/components/http-request/executor";
import { gmailTriggerExecution } from "@/features/nodes/triggers/components/email-trigger/executor";
import { geminiExecution } from "@/features/nodes/integrations/components/gemini/executor";
import { anthropicExecution } from "@/features/nodes/integrations/components/anthropic/executor";
import { openAiExecution } from "@/features/nodes/integrations/components/openai/executor";
import { discordExecution } from "@/features/nodes/integrations/components/discord/executor";
import { slackExecution } from "@/features/nodes/integrations/components/slack/executor";

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
  [NodeType.SLACK]: slackExecution,
  [NodeType.EMAIL_TRIGGER]: gmailTriggerExecution,
  [NodeType.HTML_EXTRACTOR]: httpRequestExecution,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) throw new Error(`No executor found for node type : ${type}`);

  return executor;
};

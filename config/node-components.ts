import { NodeType } from "@/app/generated/prisma/enums";
import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/features/core/components/http-request/node";
import { AnthropicNode } from "@/features/nodes/integrations/components/anthropic/node";
import { DiscordNode } from "@/features/nodes/integrations/components/discord/node";
import { GeminiNode } from "@/features/nodes/integrations/components/gemini/node";
import { OpenAiNode } from "@/features/nodes/integrations/components/openai/node";
import { SlackNode } from "@/features/nodes/integrations/components/slack/node";
import { GmailTriggerNode } from "@/features/nodes/triggers/components/email-trigger/node";
import { GoogleFormTriggerNode } from "@/features/nodes/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/nodes/triggers/components/manual-trigger/node";
import { StripeTriggerNode } from "@/features/nodes/triggers/components/stripe-trigger/node";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.EMAIL_TRIGGER]: GmailTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

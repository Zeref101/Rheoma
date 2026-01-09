import { NodeType } from "@/app/generated/prisma/enums";
import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/features/core/components/http-request/node";
import { AnthropicNode } from "@/features/integrations/components/anthropic/node";
import { DiscordNode } from "@/features/integrations/components/discord/node";
import { GeminiNode } from "@/features/integrations/components/gemini/node";
import { OpenAiNode } from "@/features/integrations/components/openai/node";
import { SlackNode } from "@/features/integrations/components/slack/node";
import { GmailTriggerNode } from "@/features/triggers/components/email-trigger/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
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

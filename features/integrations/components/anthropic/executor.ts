import type { NodeExecutor } from "@/types/constants";
import Handlebars from "handlebars";
import { AnthropicModel, AVAILABLE_MODELS } from "./dialog";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type OpenAiData = {
  credentialId?: string;
  variableName?: string;
  model?: AnthropicModel;
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecution: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.credentialId) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node: Credential is missing");
  }
  try {
    const systemPrompt = data.systemPrompt
      ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistent";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
          userId: userId,
        },
      });
    });

    if (!data.credentialId) {
      await publish(
        anthropicChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Anthropic node: Credential is missing");
    }
    if (!credential?.value) {
      await publish(
        anthropicChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Anthropic node: Credential is missing");
    }
    const anthropic = createAnthropic({
      apiKey: decrypt(credential.value),
    });

    const { steps } = await step.ai.wrap("anthropic-generate-ai", generateText, {
      model: anthropic(data.model || AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    const variableKey = data.variableName ?? "aiResponse";

    await publish(
      anthropicChannel().status({
        nodeId,
        status: "success",
      })
    );
    return {
      ...context,
      [variableKey]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};

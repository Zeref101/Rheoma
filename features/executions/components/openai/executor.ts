import type { NodeExecutor } from "@/types/constants";
import Handlebars from "handlebars";
import { AVAILABLE_MODELS, OpenAiModel } from "./dialog";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { openAiChannel } from "@/inngest/channels/openai";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type OpenAiData = {
  credentialId?: string;
  variableName?: string;
  model?: OpenAiModel;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAiExecution: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    openAiChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.credentialId) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAI node: Credential is missing");
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
        },
      });
    });

    if (!data.credentialId) {
      throw new NonRetriableError("Gemini node: Credential is missing");
    }
    const openAi = createOpenAI({
      apiKey: credential?.value,
    });

    const { steps } = await step.ai.wrap("openai-generate-ai", generateText, {
      model: openAi(data.model || AVAILABLE_MODELS[0]),
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
      openAiChannel().status({
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
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};

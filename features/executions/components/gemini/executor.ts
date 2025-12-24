import type { NodeExecutor } from "@/types/constants";
import Handlebars from "handlebars";
import { AVAILABLE_MODELS, GeminiModel } from "./dialog";
import { geminiChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type GeminiData = {
  credentialId?: string;
  variableName?: string;
  model?: GeminiModel;
  systemPrompt?: string;
  userPrompt?: string;
};

export const geminiExecution: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  userId,
  publish,
}) => {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.credentialId) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini node: Credential is missing");
  }
  try {
    const systemPrompt = data.systemPrompt
      ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistent";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
      return prisma.credential.findFirst({
        where: {
          id: data.credentialId,
          userId: userId,
        },
      });
    });

    if (!data.credentialId) {
      await publish(
        geminiChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Gemini node: Credential is missing");
    }
    if (!credential?.value) {
      await publish(
        geminiChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Gemini node: Credential is missing");
    }
    const google = createGoogleGenerativeAI({
      apiKey: decrypt(credential.value),
    });

    const { steps } = await step.ai.wrap("gemini-generate-ai", generateText, {
      model: google(data.model || AVAILABLE_MODELS[0]),
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
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};

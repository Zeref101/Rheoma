import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { inngest } from "./client";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        system: "You are a helpful assistant",
        prompt: "what is 46*57 ?",
        model: google("gemini-2.5-flash"),
      }
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        system: "You are a helpful assistant",
        prompt: "what is 46*57 ?",
        model: openai("gpt-4"),
      }
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        system: "You are a helpful assistant",
        prompt: "what is 46*57 ?",
        model: anthropic("claude-sonnet-4-5"),
      }
    );
    return { geminiSteps, openaiSteps, anthropicSteps };
  }
);

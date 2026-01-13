import type { NodeExecutor } from "@/types/constants";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { withNodeStatus } from "./utils/with-node-status";
import { LimitChannel } from "@/inngest/channels/limit";

type LimitMode = "first" | "last";
type LimitNodeData = {
  variableName?: string;
  limit?: number;
  sourceData?: string;
  mode?: LimitMode;
};
Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});
export const LimitExecution: NodeExecutor<LimitNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  return step.run("limit", () =>
    withNodeStatus({
      nodeId,
      publish,
      channel: LimitChannel(),
      run: async () => {
        const { sourceData, mode, limit } = data;

        if (!sourceData) {
          throw new NonRetriableError("Limit: source data is required");
        }
        if (typeof limit !== "number" || limit <= 0) {
          throw new NonRetriableError("Limit: limit must be a number greater than 0");
        }

        const variableName = data.variableName || "limitData";
        let resolvedInput: unknown;
        try {
          const compiled = Handlebars.compile(sourceData);
          const result = compiled(context);
          resolvedInput = JSON.parse(result);
        } catch {
          throw new NonRetriableError("Limit: source data did not resolve to valid JSON");
        }

        if (!Array.isArray(resolvedInput)) {
          throw new NonRetriableError("Limit: resolved source data is not an array");
        }

        const output =
          mode === "last" ? resolvedInput.slice(-limit) : resolvedInput.slice(0, limit);

        return {
          ...context,
          [variableName]: output,
        };
      },
    })
  );
};

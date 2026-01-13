import type { NodeExecutor } from "@/types/constants";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { withNodeStatus } from "./utils/with-node-status";
import { splitModes } from "./dialog";
import { SplitOutChannel } from "@/inngest/channels/split-out";

type SplitOutNodeData = {
  variableName?: string;
  fields?: string[];
  fieldsInput?: string;
  sourceData?: string;
  mode?: splitModes;
  keepOtherFields?: boolean;
};
Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});
export const SplitOutExecution: NodeExecutor<SplitOutNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  return step.run("split-out", () =>
    withNodeStatus({
      nodeId,
      publish,
      channel: SplitOutChannel(),
      run: async () => {
        const { fields, sourceData, mode, keepOtherFields } = data;

        if (!sourceData) {
          throw new NonRetriableError("Split Out: source data is required");
        }
        if (!(Array.isArray(fields) && fields.length > 0)) {
          throw new NonRetriableError("Split Out: no fields provided");
        }

        const variableName = data.variableName || "splitData";

        const inputData = Handlebars.compile(sourceData)(context);

        let resolvedInput: unknown;
        try {
          resolvedInput = JSON.parse(inputData);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          throw new NonRetriableError("Split Out: source data did not resolve to valid JSON");
        }

        const inputObject = Array.isArray(resolvedInput) ? resolvedInput[0] : resolvedInput;

        const output: Record<string, unknown>[] = [];
        // ? Split logic
        if (mode === "single") {
          const field = fields[0];
          const value = inputObject[field];

          if (!Array.isArray(value)) {
            throw new NonRetriableError(`Split Out (single): field "${field}" is not an array`);
          }

          for (const element of value) {
            const item: Record<string, unknown> = {};

            if (keepOtherFields) {
              Object.assign(item, inputObject);
            }

            item[field] = element;
            output.push(item);
          }
        }

        if (mode === "zip") {
          const arrays = fields.map((f) => {
            const v = inputObject[f];
            if (!Array.isArray(v)) {
              throw new NonRetriableError(`Split Out (zip): field "${f}" is not an array`);
            }
            return v;
          });

          const maxLength = Math.max(...arrays.map((a) => a.length));

          for (let i = 0; i < maxLength; i++) {
            const item: Record<string, unknown> = {};

            if (keepOtherFields) {
              Object.assign(item, inputObject);
            }

            for (let j = 0; j < fields.length; j++) {
              if (arrays[j][i] !== undefined) {
                item[fields[j]] = arrays[j][i];
              }
            }

            output.push(item);
          }
        }

        return {
          ...context,
          [variableName]: output,
        };
      },
    })
  );
};

import type { NodeExecutor } from "@/types/constants";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { withNodeStatus } from "./utils/with-node-status";
import { HtmlExtractorChannel } from "@/inngest/channels/html-extractor";
import * as cheerio from "cheerio";
import { decode } from "html-entities";

type HtmlExtraction = {
  key: string;
  selector: string;
  returnValue: "text" | "html" | "attribute";
  attribute?: string;
  skipSelectors?: string;
  returnArray: boolean;
};

type HtmlExtractorNodeData = {
  variableName?: string;
  sourceHtml?: string;
  extractions?: HtmlExtraction[];
};
Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});
export const htmlExtractorExecution: NodeExecutor<HtmlExtractorNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  return step.run("html-extractor", () =>
    withNodeStatus({
      nodeId,
      publish,
      channel: HtmlExtractorChannel(),
      run: async () => {
        if (!data?.extractions || data.extractions.length === 0) {
          throw new NonRetriableError(
            "HTML Extractor is not configured (no extraction rules found)."
          );
        }
        if (!data.sourceHtml && typeof data.sourceHtml !== "string") {
          throw new NonRetriableError("No HTML source provided to HTML Extractor.");
        }
        const variableName = data.variableName || "htmlData";

        // ? RESOLVING HTML SOURCE
        const template = Handlebars.compile(data.sourceHtml)(context);
        let html = decode(template);

        if (typeof html === "string" && html.startsWith('"') && html.endsWith('"')) {
          try {
            html = JSON.parse(html);
          } catch {}
        }

        // ? PARSING HTML

        const $ = cheerio.load(html);
        const output: Record<string, unknown> = {};

        for (const extraction of data.extractions) {
          const { key, selector, returnValue, attribute, skipSelectors, returnArray } = extraction;
          const values: unknown[] = [];

          $(selector).each((_, el) => {
            const node = $(el).clone();

            // ? filter out  unwanted child
            if (skipSelectors) {
              node.find(skipSelectors).remove();
            }
            let value: unknown = null;

            switch (returnValue) {
              case "text":
                value = node.text().trim();
                break;
              case "html":
                value = node.html();
                break;
              case "attribute":
                if (!attribute) {
                  value = null;
                } else {
                  value = node.attr(attribute);
                }
                break;
            }

            values.push(value);
          });
          output[key] = returnArray ? values : values[0];
        }
        return {
          [variableName]: output,
        };
      },
    })
  );
};

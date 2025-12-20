import type { NodeExecutor } from "@/types/constants";
import { NonRetriableError } from "inngest";
import ky, { Options as KyOptions } from "ky";
import Handlebars from "handlebars";

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};
Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});
export const httpRequestExecution: NodeExecutor<HttpRequestData> = async ({
  data,
  // nodeId,
  context,
  step,
}) => {
  const result = step.run("http-request", async () => {
    const endpoint = Handlebars.compile(data.endpoint)(context);
    if (!endpoint) {
      throw new NonRetriableError("Endpoint is required for HTTP request");
    }

    if (!data.variableName) {
      throw new NonRetriableError("Variable Name not configured");
    }
    const method = data.method || "GET";
    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (data.body) {
        const resolved = Handlebars.compile(data.body)(context);
        JSON.parse(resolved);
        console.log("Resolved HTTP body:");
        console.log(resolved);

        options.body = resolved;
        options.headers = {
          "Content-type": "application/json",
        };
      }
    }
    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type") || "";

    let responseData: unknown;

    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    const responsePayload = {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    };

    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });
  return result;
};

import type { NodeExecutor } from "@/types/constants";
import { NonRetriableError } from "inngest";
import ky, { Options as KyOptions } from "ky";

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecution: NodeExecutor<HttpRequestData> = async ({
  data,
  // nodeId,
  context,
  step,
}) => {
  const result = step.run("http-request", async () => {
    const endpoint = data.endpoint;
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
        options.body = data.body;
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

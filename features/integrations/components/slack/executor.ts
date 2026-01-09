import type { NodeExecutor } from "@/types/constants";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { decode } from "html-entities";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecution: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.webhookUrl) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Slack node: Webhook URL is missing");
  }
  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("slack node: content is missing");
  }
  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  try {
    const result = await step.run("slack-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: content, //! key depends on workflow config
        },
      });
      const variableName = data?.variableName || "mySlack";

      await publish(
        slackChannel().status({
          nodeId,
          status: "success",
        })
      );
      return {
        ...context,
        [variableName]: {
          messageContent: content,
        },
      };
    });
    return result;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};

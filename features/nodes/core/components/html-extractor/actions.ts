"use server";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { HtmlExtractorChannel } from "@/inngest/channels/html-extractor";

export type HtmlExtractorToken = Realtime.Token<typeof HtmlExtractorChannel, ["status"]>;

export async function fetchHtmlExtractorRealtimeToken(): Promise<HtmlExtractorToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: HtmlExtractorChannel(),
    topics: ["status"],
  });
  return token;
}

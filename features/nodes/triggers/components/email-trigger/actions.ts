"use server";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { gmailTriggerChannel } from "@/inngest/channels/gmail-trigger";

export type GmailTriggerToken = Realtime.Token<typeof gmailTriggerChannel, ["status"]>;

export async function fetchGmailTriggerRealtimeToken(): Promise<GmailTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: gmailTriggerChannel(),
    topics: ["status"],
  });
  return token;
}

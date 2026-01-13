"use server";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { LimitChannel } from "@/inngest/channels/limit";

export type LimitToken = Realtime.Token<typeof LimitChannel, ["status"]>;

export async function fetchLimitRealtimeToken(): Promise<LimitToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: LimitChannel(),
    topics: ["status"],
  });
  return token;
}

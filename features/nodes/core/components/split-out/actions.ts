"use server";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { SplitOutChannel } from "@/inngest/channels/split-out";

export type SplitOutToken = Realtime.Token<typeof SplitOutChannel, ["status"]>;

export async function fetchSplitOutRealtimeToken(): Promise<SplitOutToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: SplitOutChannel(),
    topics: ["status"],
  });
  return token;
}

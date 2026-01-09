import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/nodes/integrations/hooks/use-node-status";
import { fetchStripeTriggerRealtimeToken } from "./actions";
import { StripeTriggerDialog } from "./dialog";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";

export const StripeTriggerNode = memo((props: NodeProps) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: STRIPE_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchStripeTriggerRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOnSetting = () => setDialogOpen(!dialogOpen);

  return (
    <>
      <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        Icon={"/logos/stripe.svg"}
        name="Stripe"
        description="When stripe event is captured"
        status={nodeStatus}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
});

StripeTriggerNode.displayName = "StripeTriggerNode";

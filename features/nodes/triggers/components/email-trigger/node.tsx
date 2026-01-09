import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/nodes/integrations/hooks/use-node-status";
import { GmailTriggerDialog } from "./dialog";
import { fetchGmailTriggerRealtimeToken } from "./actions";
import { GMAIL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/gmail-trigger";

export const GmailTriggerNode = memo((props: NodeProps) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GMAIL_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGmailTriggerRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOnSetting = () => setDialogOpen(!dialogOpen);

  return (
    <>
      <GmailTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        Icon={"/logos/gmail.png"}
        name="Gmail"
        description="When an email is captured"
        status={nodeStatus}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
});

GmailTriggerNode.displayName = "GmailTriggerNode";

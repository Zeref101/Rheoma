import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { ManualTriggerDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const nodeStatus = "loading";
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOnSetting = () => setDialogOpen(!dialogOpen);

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        Icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        status={nodeStatus}
        onSetting={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";

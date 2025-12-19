"use client";

import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NodeSelector } from "@/components/node-selector";

export const AddNodeButton = memo(() => {
  const [selectOpen, setSelectOpen] = useState(false);
  return (
    <NodeSelector open={selectOpen} onOpenChange={setSelectOpen}>
      <Button
        onClick={() => {}}
        size={"icon"}
        variant={"outline"}
        className="bg-card border-border text-muted-foreground hover:bg-accent/10 hover:border-accent/50 hover:text-foreground h-auto w-auto cursor-pointer border border-dashed p-2 text-center shadow-none transition-colors"
      >
        <PlusIcon color="white" />
      </Button>
    </NodeSelector>
  );
});

AddNodeButton.displayName = "AddNodeButton";

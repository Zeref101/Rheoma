"use client";
import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import React, { ReactNode, useCallback } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { NodeType } from "@/app/generated/prisma/enums";
import { Separator } from "./ui/separator";
import Image from "next/image";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Trigger manually",
    description: "Runs the flow on clicking a button. Good for getting started quickly",
    icon: MousePointerIcon,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form",
    description: "Runs the flow on when a Google form is submitted",
    icon: "/logos/googleform.svg",
  },
  // {
  //   type: NodeType.STRIPE_TRIGGER,
  //   label: "Stripe Event",
  //   description: "Runs the flow on when a Stripe event is captured",
  //   icon: "/logos/stripe.svg",
  // },
];

const executionNode: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Makes an HTTP request",
    icon: GlobeIcon,
  },
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Uses Google Gemini to generate text",
    icon: "/logos/gemini.svg",
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}
export function NodeSelector({ open, onOpenChange, children }: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const handleNodeSelect = useCallback(
    (selectedNode: NodeTypeOption) => {
      if (selectedNode.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();
        const hasManualtrigger = nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
        if (hasManualtrigger) {
          toast.error("Only one manual trigger is allowed per workflow");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some((node) => node.type === NodeType.INITIAL);
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selectedNode.type,
        };
        if (hasInitialTrigger) {
          return [newNode];
        }
        return [...nodes, newNode];
      });
      onOpenChange(false);
    },
    [getNodes, setNodes, onOpenChange, screenToFlowPosition]
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>A trigger is a step that starts your workflow.</SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map((node) => (
            <NodeTypeRow key={node.type} option={node} onSelect={handleNodeSelect} />
          ))}
        </div>

        <Separator />

        <div>
          {executionNode.map((node) => (
            <NodeTypeRow key={node.type} option={node} onSelect={handleNodeSelect} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NodeTypeRowProps {
  option: NodeTypeOption;
  onSelect?: (option: NodeTypeOption) => void;
}

function NodeTypeRow({ option, onSelect }: NodeTypeRowProps) {
  const Icon = option.icon;

  return (
    <div
      className="hover:border-l-primary flex w-full cursor-pointer items-center gap-4 border-l-2 border-transparent px-4 py-5"
      onClick={() => onSelect?.(option)}
    >
      {typeof Icon === "string" ? (
        <Image
          src={Icon}
          alt={option.label}
          className="size-5 shrink-0 rounded-sm object-contain"
          width={20}
          height={20}
        />
      ) : (
        <Icon className="size-5 shrink-0" />
      )}
      <div className="flex flex-col items-start text-left">
        <span className="truncate text-sm font-medium">{option.label}</span>
        <span className="text-muted-foreground text-xs">{option.description}</span>
      </div>
    </div>
  );
}

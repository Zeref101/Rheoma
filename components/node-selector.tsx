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
    description: "Runs the flow when a Google form is submitted",
    icon: "/logos/googleform.svg",
  },
  {
    type: NodeType.EMAIL_TRIGGER,
    label: "Gmail",
    description: "Runs the flow when an email event is captured",
    icon: "/logos/gmail.png",
  },
];

const coreNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Make a request to any API",
    icon: GlobeIcon,
  },
  {
    type: NodeType.HTML_EXTRACTOR,
    label: "HTML Extractor",
    description: "Extract structured data from HTML",
    icon: "/logos/html.svg",
  },
];

const integrationNodes: NodeTypeOption[] = [
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Generate text with Google Gemini",
    icon: "/logos/gemini.svg",
  },
  {
    type: NodeType.OPENAI,
    label: "OpenAI",
    description: "Generate text with OpenAI models",
    icon: "/logos/openai.svg",
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic",
    description: "Generate text with Anthropic models",
    icon: "/logos/anthropic.svg",
  },
  {
    type: NodeType.DISCORD,
    label: "Discord",
    description: "Send a message to Discord",
    icon: "/logos/discord.svg",
  },
  {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send a message to Slack",
    icon: "/logos/slack.svg",
  },
];
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <h4 className="text-muted-foreground mb-2 px-4 text-xs font-semibold uppercase">{title}</h4>
      <div>{children}</div>
    </div>
  );
}

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
          <SheetTitle>Add a node</SheetTitle>
          <SheetDescription>Choose a trigger, logic step, or integration.</SheetDescription>
        </SheetHeader>
        <Section title="Triggers">
          {triggerNodes.map((node) => (
            <NodeTypeRow key={node.type} option={node} onSelect={handleNodeSelect} />
          ))}
        </Section>

        <Separator />

        <Section title="Integrations">
          {integrationNodes.map((node) => (
            <NodeTypeRow key={node.type} option={node} onSelect={handleNodeSelect} />
          ))}
        </Section>

        <Separator />

        <Section title="Core">
          {coreNodes.map((node) => (
            <NodeTypeRow key={node.type} option={node} onSelect={handleNodeSelect} />
          ))}
        </Section>
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

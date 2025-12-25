"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { appsScriptCode } from "./util/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}api/webhooks/google-form?workflowId=${workflowId}`;

  const copyToCipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error(error);
    }
  };

  const copyAppsScript = async () => {
    const script = appsScriptCode(webhookUrl);
    try {
      await navigator.clipboard.writeText(script);
      toast.success("Google Apps Script copied");
    } catch (error) {
      toast.error("Failed to copy script");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>Configure settings for the manual trigger node.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button type="button" size={"icon"} variant={"outline"} onClick={copyToCipboard}>
                <CopyIcon className="text-muted-foreground group-hover:text-foreground mr-2 size-4 transition-colors" />
              </Button>
            </div>
          </div>
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Setup instructions:</h4>
            <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
              <li>Open your Google Form.</li>
              <li>
                Click <strong>⋮ (three dots) → Apps Script</strong>.
              </li>
              <li>
                Copy the function from the <strong>Copy</strong> button below and paste it into the
                script editor.
              </li>
              <li>Save the script.</li>
              <li>
                Go to <strong>Triggers</strong>.
              </li>
              <li>
                Open <strong>Triggers</strong>, set the <strong>event source</strong> →{" "}
                <strong>From form</strong>, and <strong>event type</strong> →{" "}
                <strong>On form submit</strong> and save.
              </li>

              <li>Submit a test response in your Google Form to verify the trigger.</li>
            </ol>
          </div>

          <div className="bg-muted space-y-3 rounded-lg p-4">
            <h4 className="text-sm font-medium">Google Apps Script</h4>

            <Button
              type="button"
              variant="outline"
              onClick={copyAppsScript}
              className="group hover:text-muted-foreground"
            >
              <CopyIcon className="text-muted-foreground mr-2 size-4 transition-colors" />
              Copy Google Apps Script
            </Button>

            <p className="text-muted-foreground text-xs">
              This script includes your webhook URL and handles form submissions automatically.
            </p>
          </div>
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Available Variables</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{formData.respondentEmail}}"}
                </code>
                - Responded&apos; email
              </li>
              <li className="items-start gap-2">
                <code className="bg-background rounded px-1 py-0.5 font-mono text-xs">
                  {"{{ formData.responses['<Question Title>'] }}"}
                </code>
                - Specific answer by question title
              </li>
              <li className="items-start gap-2">
                <code className="bg-background rounded px-1 py-0.5 font-mono text-xs">
                  {"{{ json formData.responses}}"}
                </code>
                - All responses as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

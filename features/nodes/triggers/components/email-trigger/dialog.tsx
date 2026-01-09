"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { appsScriptCode } from "./util/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GmailTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/";
  const webhookUrl = `${baseUrl}api/webhooks/email?workflowId=${workflowId}`;

  // const copyToCipboard = async () => {
  //   try {
  //     await navigator.clipboard.writeText(webhookUrl);
  //     toast.success("Webhook URL copied to clipboard");
  //   } catch (error) {
  //     toast.error("Failed to copy URL");
  //     console.error(error);
  //   }
  // };

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
          <DialogTitle>Gmail Trigger Configuration</DialogTitle>
          <DialogDescription>Configure settings for the gmail node.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button type="button" size={"icon"} variant={"outline"} onClick={copyToCipboard}>
                <CopyIcon className="text-muted-foreground group-hover:text-foreground mr-2 size-4 transition-colors" />
              </Button>
            </div>
          </div> */}
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Setup instructions:</h4>
            <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
              <li>
                Open <strong>https://script.google.com</strong>.
              </li>

              <li>
                Click <strong>New project</strong> to create a Google Apps Script project.
              </li>

              <li>
                Rename the project (for example, <strong>Gmail Webhook Listener</strong>).
              </li>
              <li>
                Copy the script from the <strong>Copy</strong> button below and paste it into the
                Apps Script editor and <strong>Save</strong>.
              </li>

              <li>
                Open <strong>Triggers</strong> and Click <strong>+ Add Trigger</strong> and set:
                <ul className="ml-5 list-disc">
                  <li>
                    <strong>Choose function</strong> → <code>checkNewEmails</code>
                  </li>
                  <li>
                    <strong>Event source</strong> → <strong>Time-driven</strong> or choose according
                    to your usecase
                  </li>
                  <li>
                    <strong>Time interval</strong> → <strong>Every 1 minute</strong> or choose
                    according to your usecase
                  </li>
                </ul>
              </li>

              <li>
                Save the trigger and <strong>approve permissions</strong> when prompted by Google.
              </li>

              <li>Send yourself a test email to verify the automation.</li>
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
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <code className="bg-background rounded px-1.5 py-0.5 font-mono text-xs">
                  {"{{ emailData.subject }}"}
                </code>
                <span className="ml-2">— The subject line of the email</span>
              </li>

              <li>
                <code className="bg-background rounded px-1.5 py-0.5 font-mono text-xs">
                  {"{{ emailData.from }}"}
                </code>
                <span className="ml-2">— The sender’s email address</span>
              </li>

              <li>
                <code className="bg-background rounded px-1.5 py-0.5 font-mono text-xs">
                  {"{{ emailData.body }}"}
                </code>
                <span className="ml-2">— The full plain-text content of the email</span>
              </li>

              <li>
                <code className="bg-background rounded px-1.5 py-0.5 font-mono text-xs">
                  {"{{ json emailData }}"}
                </code>
                <span className="ml-2">— Entire email payload as structured JSON</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  const copyToCipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this workflow on payment
            events.
          </DialogDescription>
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
              <li>Open your Stripe Dashboard.</li>
              <li>
                Go to <strong>Developers → Webhooks</strong>.
              </li>
              <li>
                Click <strong>“Add endpoint”</strong>.
              </li>
              <li>Paste the webhook URL shown above.</li>
              <li>
                Select the events to listen for (e.g., <code>payment_intent.succeeded</code>).
              </li>
              <li>Save the endpoint and copy the signing secret.</li>
            </ol>
          </div>
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Available Variables</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                <code className="bg-background rounded px-1 py-0.5">{"{{stripe.amount}}"}</code>-
                Payment amount
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">{"{{stripe.currency}}"}</code>-
                Currency code
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">{"{{stripe.customerId}}"}</code>
                - Customer ID
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">{"{{json stripe}}"}</code>- Full
                event data as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

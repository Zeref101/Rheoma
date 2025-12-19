"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ManualTriggerDialog = (
    { open,
        onOpenChange
    }: Props
) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manual Trigger</DialogTitle>
                    <DialogDescription>
                        Configure settings for the manual trigger node.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        The Manual Trigger node allows you to start this workflow on demand. Use it for testing,
                        debugging, or workflows that should only run when you explicitly initiate them.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
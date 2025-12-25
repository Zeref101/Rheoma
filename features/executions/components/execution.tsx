"use client";
import { ExecutionStatus } from "@/app/generated/prisma/enums";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSuspenseExecution } from "../hooks/use-executions";
import { formatDistanceToNow } from "date-fns";

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-500" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-500" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 animate-spin text-blue-500" />;
    default:
      return <ClockIcon className="size-5 text-blue-500" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution?.completedAt
    ? Math.round(
      (new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000
    )
    : null;
  return (
    <Card className="shadow-none">
      <CardHeader className="border-border/60 border-b">
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>{formatStatus(execution.status)}</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Workflow</p>
          <Link
            href={`/workflows/${execution.workflowId}`}
            className="text-primary hover:underline"
          >
            {execution.workflow.name}
          </Link>

          <p className="text-muted-foreground text-xs tracking-wide uppercase">Status</p>
          <p>{formatStatus(execution.status)}</p>

          <p className="text-muted-foreground text-xs tracking-wide uppercase">Started</p>
          <p>{formatDistanceToNow(execution.startedAt, { addSuffix: true })}</p>

          {execution.completedAt && (
            <>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">Completed</p>
              <p>
                {formatDistanceToNow(execution.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </>
          )}

          {duration !== null && (
            <>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">Duration</p>
              <p>{duration}s</p>
            </>
          )}

          <p className="text-muted-foreground text-xs tracking-wide uppercase">Event ID</p>
          <p className="font-mono text-xs">{execution.inngestEventId}</p>
        </div>
        {execution.error && (
          <div className="bg-destructive/10 text-destructive dark:bg-destructive/15 mt-6 space-y-3 rounded-md p-4">
            <div>
              <p className="text-destructive text-sm font-medium">Error</p>
              <p className="text-destructive/90 font-mono text-sm wrap-break-word whitespace-pre-wrap">
                {execution.error}
              </p>
            </div>
          </div>
        )}
        {execution.errorStack && (
          <Collapsible open={showStackTrace} onOpenChange={setShowStackTrace}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
              >
                {showStackTrace ? "Hide stack trace" : "Show stack trace"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="scrollbar-hide mt-2 max-h-64 overflow-auto rounded-md border bg-destructive/10 p-3 font-mono text-xs leading-relaxed text-red-400">
                {execution.errorStack}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
        {execution.output && (
          <div className="bg-muted/60 border-border mt-8 rounded-md border p-4">
            <p className="text-muted-foreground mb-2 text-sm font-medium">Output</p>
            <pre className="text-foreground/90 overflow-auto font-mono text-sm">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

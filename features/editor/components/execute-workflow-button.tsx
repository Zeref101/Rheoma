import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";

export const ExecuteWorkflowButton = ({ workflowid }: { workflowid: string }) => {
  const executeWorkflow = useExecuteWorkflow();

  const handleExecution = () => {
    executeWorkflow.mutate({ id: workflowid });
  };
  return (
    <Button size={"lg"} onClick={handleExecution} disabled={executeWorkflow.isPending}>
      <FlaskConicalIcon className="size-4" />
      Execute Workflow
    </Button>
  );
};

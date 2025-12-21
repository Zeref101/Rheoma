import { workflowsParams } from "@/features/workflows/params";
import { type Realtime } from "@inngest/realtime";
import { GetStepTools, Inngest } from "inngest";
import { inferParserType, SearchParams } from "nuqs";

export type SearchProps = {
  searchParams: Promise<SearchParams>;
};

export type GetManyInput = {
  page: number;
  pageSize: number;
  search: string;
};

export type WorkflowsParams = inferParserType<typeof workflowsParams>;

export type WorkflowsListProps = {
  initialParams?: WorkflowsParams;
};

export type EntityContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
};

export type EntityHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | {
      onNew: () => void;
      newButtonHref?: never;
    }
  | {
      newButtonHref: string;
      onNew?: never;
    }
  | {
      onNew?: never;
      newButtonHref?: never;
    }
);

export type WorkflowContext = Record<string, unknown>;
export type StepTools = GetStepTools<Inngest.Any>;
export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData;
  nodeId: string;
  context: WorkflowContext;
  step: StepTools;
  publish: Realtime.PublishFn;
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>;

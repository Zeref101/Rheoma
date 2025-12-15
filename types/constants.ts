import { workflowsParams } from "@/features/workflows/params";
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

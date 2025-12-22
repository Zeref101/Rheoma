import { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/app/generated/prisma/enums";
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/routers/init";
import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/util/utils";

export const workflowsRouter = createTRPCRouter({
  //  * - `execute`: Executes a workflow by its ID.
  //  *   - **Input:** `{ id: string }`
  //  *   - **Returns:** The workflow object.
  //  *   - **Notes:** Triggers an external event for workflow execution.
  execute: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const workflow = await prisma.workflow.findUniqueOrThrow({
      where: {
        id: input.id,
      },
    });
    await sendWorkflowExecution({
      workflowId: input.id,
    });
    return workflow;
  }),
  //  *   - `create`: Creates a new workflow for the authenticated user.
  //  *   - **Input:** None
  //  *   - **Returns:** The created workflow object.
  //  *   - **Notes:** Initializes the workflow with a single initial node.
  create: protectedProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(6),
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL,
          },
        },
      },
    });
  }),
  //  * - `remove`: Deletes a workflow by its ID for the authenticated user.
  //  *   - **Input:** `{ id: string }`
  //  *   - **Returns:** The deleted workflow object.
  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return prisma.workflow.delete({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
      },
    });
  }),
  //  * - `update`: Updates the nodes and edges of a workflow.
  //  *   - **Input:**
  //  *     ```typescript
  //  *     {
  //  *       id: string,
  //  *       nodes: Array<{
  //  *         id: string,
  //  *         type?: string,
  //  *         position: { x: number, y: number },
  //  *         data?: Record<string, unknown>
  //  *       }>,
  //  *       edges: Array<{
  //  *         source: string,
  //  *         target: string,
  //  *         sourceHandle?: string,
  //  *         targetHandle?: string
  //  *       }>
  //  *     }
  //  *     ```
  //  *   - **Returns:** The updated workflow object.
  //  *   - **Notes:** Replaces all nodes and connections in a transaction for consistency.
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          })
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
      // * trassaction for consistency
      return await prisma.$transaction(async (tx) => {
        // *deleting nodes which deletes the connections as well (cascading)
        await tx.node.deleteMany({
          where: { workflowId: id },
        });
        // * create new nodes
        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            name: node.type ?? "unknown",
            type: node.type as NodeType,
            position: node.position,
            data: node.data || {},
          })),
        });
        // * create connections
        await tx.connection.createMany({
          data: edges.map((edge) => ({
            workflowId: id,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle ?? "main",
            toInput: edge.targetHandle ?? "main",
          })),
        });
        await tx.workflow.update({
          where: { id },
          data: {
            updatedAt: new Date(),
          },
        });
        return workflow;
      });
    }),
  //  * - `updateName`: Updates the name of a workflow.
  //  *   - **Input:** `{ id: string, name: string }`
  //  *   - **Returns:** The updated workflow object.
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  //  * - `getOne`: Retrieves a single workflow by its ID for the authenticated user.
  //  *   - **Input:** `{ id: string }`
  //  *   - **Returns:** An object containing the workflow's id, name, nodes, and edges.
  //  *   - **Notes:** Converts server-side nodes and connections to client-expected formats.
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const workflow = await prisma.workflow.findUniqueOrThrow({
      where: { id: input.id, userId: ctx.auth.user.id },
      include: { nodes: true, connections: true },
    });
    //? convert server nodes to react-flow expected Nodes
    const nodes: Node[] = workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position as { x: number; y: number },
      data: (node.data as Record<string, unknown>) || {},
    }));
    //? convert server connections to react-flow expected Connections
    const edges: Edge[] = workflow.connections.map((connection) => ({
      id: connection.id,
      source: connection.fromNodeId,
      target: connection.toNodeId,
      sourceHandle: connection.fromOutput,
      targetHandle: connection.toInput,
    }));

    return {
      id: workflow.id,
      name: workflow.name,
      nodes,
      edges,
    };
  }),
  //  * - `getMany`: Retrieves a paginated list of workflows for the authenticated user, with optional search.
  //  *   - **Input:**
  //  *     ```typescript
  //  *     {
  //  *       page?: number,
  //  *       pageSize?: number,
  //  *       search?: string
  //  *     }
  //  *     ```
  //  *   - **Returns:** An object containing items, pagination info, and total counts.
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      console.log(items, page);
      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      };
    }),
});

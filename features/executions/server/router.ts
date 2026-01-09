import { createTRPCRouter, protectedProcedure } from "@/app/trpc/routers/init";
import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import z from "zod";

export const executionsRouter = createTRPCRouter({
  /**
   * - `getOne`: Retrieves a single execution by ID for the authenticated user.
   * - **Input:** `{ id: string }`
   * - **Returns:** The credential object.
   * - **Notes:** Throws if the credential does not exist or does not belong to the user.
   */
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return prisma.execution.findUniqueOrThrow({
      where: {
        id: input.id,
        workflow: {
          userId: ctx.auth.user.id,
        },
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }),

  /**
   * - `getMany`: Retrieves a paginated list of credentials for the authenticated user.
   * - **Input:**
   *   ```ts
   *   {
   *     page?: number,
   *     pageSize?: number,
   *     search?: string
   *   }
   *   ```
   * - **Returns:** A paginated list of credentials with metadata.
   * - **Notes:** Supports case-insensitive search by credential name.
   */
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const [items, totalCount] = await Promise.all([
        prisma.execution.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            workflow: {
              userId: ctx.auth.user.id,
            },
          },
          orderBy: {
            startedAt: "desc",
          },
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.execution.count({
          where: {
            workflow: {
              userId: ctx.auth.user.id,
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }),
});

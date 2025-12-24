import { CredentialType } from "@/app/generated/prisma/enums";
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/routers/init";
import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import z from "zod";

export const credentialsRouter = createTRPCRouter({
  /**
   * - `create`: Creates a new credential for the authenticated user.
   * - **Input:**
   *   ```ts
   *   {
   *     name: string,
   *     type: CredentialType,
   *     value: string
   *   }
   *   ```
   * - **Returns:** The newly created credential object.
   * - **Notes:** Credentials are scoped to the authenticated user and can later be attached to nodes.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name, type, value } = input;
      return prisma.credential.create({
        data: {
          name,
          userId: ctx.auth.user.id,
          type,
          value: encrypt(value),
        },
      });
    }),

  /**
   * - `remove`: Deletes a credential owned by the authenticated user.
   * - **Input:** `{ id: string }`
   * - **Returns:** The deleted credential object.
   * - **Notes:** The credential must belong to the current user.
   */
  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return prisma.credential.delete({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
      },
    });
  }),

  /**
   * - `update`: Updates an existing credential for the authenticated user.
   * - **Input:**
   *   ```ts
   *   {
   *     id: string,
   *     name: string,
   *     type: CredentialType,
   *     value: string
   *   }
   *   ```
   * - **Returns:** The updated credential object.
   * - **Notes:** Only credentials owned by the user can be updated.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, value } = input;

      return prisma.credential.update({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
        data: {
          name,
          type,
          value: encrypt(value),
        },
      });
    }),

  /**
   * - `getOne`: Retrieves a single credential by ID for the authenticated user.
   * - **Input:** `{ id: string }`
   * - **Returns:** The credential object.
   * - **Notes:** Throws if the credential does not exist or does not belong to the user.
   */
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return prisma.credential.findUniqueOrThrow({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
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
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.credential.findMany({
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
        prisma.credential.count({
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

  /**
   * - `getByType`: Retrieves all credentials of a specific type for the authenticated user.
   * - **Input:** `{ type: CredentialType }`
   * - **Returns:** A list of credentials matching the given type.
   * - **Notes:** Commonly used when attaching credentials to nodes.
   */
  getByType: protectedProcedure
    .input(
      z.object({
        type: z.enum(CredentialType),
      })
    )
    .query(({ ctx, input }) => {
      const { type } = input;
      return prisma.credential.findMany({
        where: {
          type,
          userId: ctx.auth.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
});

// import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "./init";
export const appRouter = createTRPCRouter({
  getUsers: baseProcedure.query(() => {
    return {
      users: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
    };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;

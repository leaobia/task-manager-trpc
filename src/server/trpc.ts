import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.create({
  transformer: superjson,
  // Zod errors arrive as a JSON string by default; expose the first issue instead.
  errorFormatter({ shape, error }) {
    const message =
      error.cause instanceof ZodError
        ? error.cause.issues[0].message
        : shape.message;
    return { ...shape, message };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCallerFactory, publicProcedure, router } from "./trpc";

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

// Kept on globalThis so the list survives dev hot reloads.
const globalStore = globalThis as unknown as { tasks?: Task[] };
const tasks = (globalStore.tasks ??= []);

const taskInput = z.object({
  titulo: z.string().trim().min(1, "Title is required"),
  descricao: z.string().trim().optional(),
});

function findIndex(id: string) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
  }
  return index;
}

export const appRouter = router({
  task: router({
    // Offset-based cursor, newest first, to support infinite scroll.
    list: publicProcedure
      .input(
        z.object({
          cursor: z.number().int().min(0).default(0),
          limit: z.number().int().min(1).max(50).default(10),
        }),
      )
      .query(({ input }) => {
        const sorted = [...tasks].sort(
          (a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime(),
        );
        const items = sorted.slice(input.cursor, input.cursor + input.limit);
        const next = input.cursor + items.length;
        return { items, nextCursor: next < sorted.length ? next : undefined };
      }),

    get: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
      return tasks[findIndex(input.id)];
    }),

    create: publicProcedure.input(taskInput).mutation(({ input }) => {
      const task: Task = {
        id: crypto.randomUUID(),
        titulo: input.titulo,
        descricao: input.descricao || undefined,
        dataCriacao: new Date(),
      };
      tasks.push(task);
      return task;
    }),

    update: publicProcedure
      .input(taskInput.extend({ id: z.string() }))
      .mutation(({ input }) => {
        const task = tasks[findIndex(input.id)];
        task.titulo = input.titulo;
        task.descricao = input.descricao || undefined;
        return task;
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        tasks.splice(findIndex(input.id), 1);
        return { id: input.id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);

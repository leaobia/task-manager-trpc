"use client";

import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/router";
import { trpc } from "@/trpc/client";

type ListData = inferRouterOutputs<AppRouter>["task"]["list"];

export function TaskList({ initialData }: { initialData: ListData }) {
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  // Data comes from SSR; the query only takes over for refetches.
  const list = trpc.task.list.useQuery({ limit: 50 }, { initialData });

  const remove = trpc.task.delete.useMutation({
    onSuccess: async () => {
      setFeedback({ ok: true, text: "Task deleted" });
      // Refetch instead of editing the cache, so offset pagination stays consistent.
      await utils.task.list.invalidate();
    },
    onError: (error) =>
      setFeedback({ ok: false, text: error.message || "Could not delete task" }),
  });

  const tasks = list.data?.items ?? [];

  return (
    <div>
      {feedback && (
        <p
          role="status"
          className={`mb-4 rounded border p-2 text-sm ${
            feedback.ok
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {list.isError && (
        <p className="mb-4 text-sm text-red-700">Could not load tasks</p>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-600">No tasks yet</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start justify-between gap-4 rounded border p-3"
            >
              <div>
                <h2 className="font-medium">{task.titulo}</h2>
                {task.descricao && (
                  <p className="text-sm text-gray-600">{task.descricao}</p>
                )}
                <p
                  suppressHydrationWarning
                  className="mt-1 text-xs text-gray-500"
                >
                  {task.dataCriacao.toLocaleString("en-US")}
                </p>
              </div>
              <button
                onClick={() => remove.mutate({ id: task.id })}
                disabled={remove.isPending && remove.variables?.id === task.id}
                className="rounded border px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                {remove.isPending && remove.variables?.id === task.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

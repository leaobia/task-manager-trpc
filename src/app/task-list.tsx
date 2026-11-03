"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/router";
import { trpc } from "@/trpc/client";

type ListData = inferRouterOutputs<AppRouter>["task"]["list"];

export function TaskList({
  initialData,
  pageSize,
}: {
  initialData: ListData;
  pageSize: number;
}) {
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  // The SSR result seeds the first page. Cursors are offsets, so a refetch
  // after a mutation rebuilds the pages from the start and stays consistent.
  const list = trpc.task.list.useInfiniteQuery(
    { limit: pageSize },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: { pages: [initialData], pageParams: [0] },
    },
  );

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const remove = trpc.task.delete.useMutation({
    onSuccess: async () => {
      setFeedback({ ok: true, text: "Task deleted" });
      await utils.task.list.invalidate();
    },
    onError: (error) =>
      setFeedback({ ok: false, text: error.message || "Could not delete task" }),
  });

  const tasks = list.data?.pages.flatMap((page) => page.items) ?? [];

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
                <p className="mt-1 text-xs text-gray-500">
                  {task.dataCriacao.toLocaleString("en-US", {
                    timeZone: "America/Sao_Paulo",
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/tasks/${task.id}/edit`}
                  className="rounded border px-2 py-1 text-sm hover:bg-gray-100"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Delete this task?")) {
                      remove.mutate({ id: task.id });
                    }
                  }}
                  disabled={remove.isPending && remove.variables?.id === task.id}
                  className="rounded border px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  {remove.isPending && remove.variables?.id === task.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tasks.length > 0 && (
        <div ref={sentinelRef} className="py-4 text-center text-sm text-gray-500">
          {list.isFetchingNextPage
            ? "Loading more..."
            : list.hasNextPage
              ? null
              : "No more tasks"}
        </div>
      )}
    </div>
  );
}

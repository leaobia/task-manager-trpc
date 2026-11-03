"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/trpc/client";

type TaskFormProps = {
  task?: { id: string; titulo: string; descricao?: string };
};

export function TaskForm({ task }: TaskFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [error, setError] = useState<string | null>(null);

  const onSuccess = async () => {
    await utils.task.list.invalidate();
    router.push("/");
  };
  const onError = (err: { message: string }) =>
    setError(err.message || "Could not save task");

  const create = trpc.task.create.useMutation({ onSuccess, onError });
  const update = trpc.task.update.useMutation({ onSuccess, onError });
  const isPending = create.isPending || update.isPending;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!titulo.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    if (task) {
      update.mutate({ id: task.id, titulo, descricao });
    } else {
      create.mutate({ titulo, descricao });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="titulo" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label htmlFor="descricao" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          className="w-full rounded border p-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded border px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          {isPending ? "Saving..." : task ? "Save changes" : "Create task"}
        </button>
        <Link href="/" className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
          Cancel
        </Link>
      </div>
    </form>
  );
}

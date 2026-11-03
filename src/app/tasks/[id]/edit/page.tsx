import { notFound } from "next/navigation";
import { TaskForm } from "@/app/task-form";
import { createCaller } from "@/server/router";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await createCaller({})
    .task.get({ id })
    .catch(() => null);
  if (!task) notFound();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit task</h1>
      <TaskForm task={task} />
    </main>
  );
}

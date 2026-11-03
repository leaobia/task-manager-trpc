import { TaskForm } from "@/app/task-form";

export default function NewTaskPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">New task</h1>
      <TaskForm />
    </main>
  );
}

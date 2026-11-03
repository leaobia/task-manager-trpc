import { TaskList } from "@/app/task-list";
import { createCaller } from "@/server/router";

// The store is in memory and changes at runtime, so never prerender at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await createCaller({}).task.list({ limit: 50 });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Tasks</h1>
      <TaskList initialData={initialData} />
    </main>
  );
}

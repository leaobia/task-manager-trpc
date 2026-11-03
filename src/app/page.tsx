import Link from "next/link";
import { TaskList } from "@/app/task-list";
import { createCaller } from "@/server/router";

// The store is in memory and changes at runtime, so never prerender at build time.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Home() {
  const initialData = await createCaller({}).task.list({ limit: PAGE_SIZE });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link
          href="/tasks/new"
          className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
        >
          New task
        </Link>
      </div>
      <TaskList initialData={initialData} pageSize={PAGE_SIZE} />
    </main>
  );
}

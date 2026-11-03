# Task Manager

A small task manager built with Next.js 15 (App Router), tRPC v11, React Query v5, Zod and Tailwind. Tasks live in memory on the server. There is no database.

Features: list tasks with SSR and infinite scroll, create, edit and delete tasks, with form validation and error feedback.

## How to run

Requires Node 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The store starts with 25 sample tasks.

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Project structure

```
src/
  server/
    trpc.ts        tRPC init, superjson, error formatter
    router.ts      in-memory store and task procedures
  trpc/
    client.tsx     React Query and tRPC providers
  app/
    api/trpc/[trpc]/route.ts   HTTP handler
    page.tsx                   list page (SSR)
    task-list.tsx              list, infinite scroll, delete
    task-form.tsx              shared create/edit form
    tasks/new/page.tsx         create page
    tasks/[id]/edit/page.tsx   edit page
```

## API

Task fields: `id`, `titulo`, `descricao` (optional), `dataCriacao`. Field names follow the challenge spec.

| Procedure | Type | Input | Errors |
| --- | --- | --- | --- |
| `task.list` | query | `cursor` (int >= 0, default 0), `limit` (1-50, default 10) | none |
| `task.get` | query | `id` | `NOT_FOUND` |
| `task.create` | mutation | `titulo` (required), `descricao` | `BAD_REQUEST` if `titulo` is empty |
| `task.update` | mutation | `id`, `titulo` (required), `descricao` | `NOT_FOUND`, `BAD_REQUEST` |
| `task.delete` | mutation | `id` | `NOT_FOUND` |

`task.list` returns `{ items, nextCursor }`, newest first. `nextCursor` is `undefined` on the last page.

Error messages are readable strings, such as "Title is required" and "Task not found".

## Technical decisions

- **SSR through a server caller.** The list page calls the router directly with `createCaller`. No HTTP round trip on the server. The result seeds `useInfiniteQuery` as its first page.
- **Offset cursor.** Simple and enough for an in-memory list. After any mutation the list is invalidated, so React Query refetches all loaded pages from the start. This avoids gaps and duplicates that offset pagination can cause.
- **Zod error formatter.** By default tRPC sends Zod errors as a JSON string. The formatter returns the first issue message instead.
- **Store on `globalThis`.** It survives hot reloads in development.
- **Fixed date format.** Dates use `en-US` and `America/Sao_Paulo`, so server and browser render the same text.
- **One form component.** `TaskForm` creates when it has no task and updates when it has one. It validates the title on the client before sending.
- **`force-dynamic`.** Pages that read the store are not prerendered at build time.

## Limitations

- Data is lost on restart.
- With several server instances or serverless functions, each has its own store.
- No authentication.
- Offset pagination can still shift items if another client changes the list between page loads. The next refetch corrects it.

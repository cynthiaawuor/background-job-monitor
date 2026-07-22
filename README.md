# Background Job Monitor

A small background job queue with worker heartbeats, dead-worker recovery,
retry/backoff, and a React dashboard that watches the whole thing live over
WebSockets.

This README is the map: what each moving part does, how data flows between
them, the timing knobs that govern liveness/recovery, the job lifecycle, and
some hands-on usage examples.

## Architecture

```mermaid
flowchart TD
    subgraph NODE["Node process — src/server.ts (npm run dev / npm start)"]
        PRODUCER["Producer\nsrc/producer.ts\ncron, every 5s"]
        WORKERA["Worker worker-A\nsrc/worker.ts"]
        WORKERB["Worker worker-B\nsrc/worker.ts"]
        RECOVERY["Recovery loop\nsrc/recovery.ts\nsweeps every 5s"]
        API["Express REST API\nsrc/routes/*"]
        WS["WebSocket server (ws)\nsrc/websocket/server.ts"]
    end

    STORE[("PostgreSQL\njobs · workers · job_events")]
    DASHBOARD["React dashboard\ndashboard/ — Vite, separate process\nlocalhost:5173"]

    PRODUCER -- "INSERT job (state=queued)" --> STORE
    WORKERA -- "SELECT ... FOR UPDATE SKIP LOCKED\nUPDATE state/heartbeat" --> STORE
    WORKERB -- "SELECT ... FOR UPDATE SKIP LOCKED\nUPDATE state/heartbeat" --> STORE
    RECOVERY -- "mark dead workers,\nrequeue their in-flight jobs" --> STORE
    API -- "SELECT (read-only queries)" --> STORE

    PRODUCER -. "broadcast() job.enqueued" .-> WS
    WORKERA -. "broadcast() job.claimed/completed/failed" .-> WS
    WORKERB -. "broadcast() job.claimed/completed/failed" .-> WS
    RECOVERY -. "broadcast() worker.updated / job.reclaimed" .-> WS

    DASHBOARD -- "GET /jobs/*, /queue/depth, /workers\nPOST /jobs/:id/retry" --> API
    WS == "live event push (WebSocket)" ==> DASHBOARD
```

**Why everything is one process today:** `producer.ts`, `worker.ts`, and
`recovery.ts` are separate modules, each exporting its own `start*()`
function — architecturally they're independent components. `server.ts`
starts all of them in-process (see commit `25c929a`) specifically so they
can call the *same* in-memory `broadcast()` function exposed by
`src/websocket/server.ts`. If a producer or worker ran as its own OS
process today, its `broadcast()` calls would silently no-op (the guard at
`src/websocket/server.ts:25`), and its job events would never reach the
dashboard in real time — only the next REST poll would show them. So for
now, "run the server" means "run the producer, both workers, and the
recovery loop together."

### Components

| Component | File(s) | Responsibility |
|---|---|---|
| Producer | `src/producer.ts` | Demo job generator. On a cron tick, enqueues the next job from a fixed list of 5 sample jobs, then stops. |
| Worker | `src/worker.ts` | Polls for the oldest queued job, claims it atomically (`FOR UPDATE SKIP LOCKED`), "processes" it (simulated with a 3s sleep as a placeholder), then marks it completed or failed. Sends a heartbeat on a timer the whole time it's alive. `server.ts` currently starts two: `worker-A` and `worker-B`. |
| Recovery | `src/recovery.ts` | Background sweep: finds workers whose heartbeat has gone stale, marks them dead, and requeues any job they had in flight. |
| API / WebSocket server | `src/server.ts`, `src/routes/*`, `src/websocket/*` | Express REST API for snapshots (`/jobs/*`, `/queue/depth`, `/workers`) and retry, plus a `ws` WebSocket server that pushes live events to connected dashboards. |
| Store | PostgreSQL via `drizzle-orm` (`src/db/schema/*`) | Three tables: `jobs`, `workers`, `job_events` (an append-only audit trail of every state transition). |
| Dashboard | `dashboard/` | React + Vite SPA. Loads an initial snapshot over REST, then subscribes to the WebSocket for live updates (see `dashboard/src/App.tsx`). |

## Timing configuration

These values aren't (yet) environment variables — they're constants in the
code. If you change them, edit the file listed below.

| Setting | Value | Where | What it governs |
|---|---|---|---|
| Heartbeat interval | 10s | `src/worker.ts:42` | How often a live worker writes `lastHeartbeat` to the `workers` table and broadcasts `worker.updated`. |
| Dead threshold / reclaim timeout | 30s | `src/services/queue.ts:209` (`timeout = 30000`) | A worker whose `lastHeartbeat` is older than this is marked `dead`; any job it holds `in_flight` is simultaneously reclaimed back to `queued`. In this codebase the "how stale is dead" threshold and the "how long before we take the job back" timeout are the same constant. |
| Recovery sweep interval | 5s | `src/recovery.ts:13` | How often the recovery loop re-checks for dead workers and runs the reclaim above. |
| Worker idle poll interval | 5s | `src/worker.ts:59` | How long an idle worker waits before checking the queue again after finding nothing to claim. |
| Producer tick | 5s (cron `*/5 * * * * *`) | `src/producer.ts:51` | Cadence at which the demo producer enqueues its next sample job (stops after 5). |
| Retry backoff | `2^retryCount * 5` seconds | `src/services/backoff.ts` | Delay before a failed job (with retries remaining) becomes eligible to retry. Retry 1 → 10s, retry 2 → 20s, retry 3 → 40s, etc. |
| Max retries (default) | 3 | `src/db/schema/jobs.ts` (`maxRetries`) | Per-job, defaults to 3 unless overridden at creation. |

## Job lifecycle

```mermaid
stateDiagram-v2
    [*] --> queued: enqueueJob()
    queued --> in_flight: worker claims\n(claimNextJob)
    in_flight --> completed: completeJob()
    in_flight --> delayed: failJob()\nretries remaining
    in_flight --> failed: failJob()\nretries exhausted
    in_flight --> queued: reclaimJobsFromDeadWorker()\nowning worker went dead
    failed --> queued: POST /jobs/:id/retry\n(manual)
    completed --> [*]
    failed --> [*]
```

- **queued** — waiting to be claimed. Ordered by `priority DESC, created_at ASC`.
- **in_flight** — claimed by a worker (`workerId` + `startedAt` set). Only the
  owning worker may complete or fail it; a stale `in_flight` job is picked up
  by recovery instead.
- **delayed** — failed, but retries remain. `retryCount` is incremented and
  `retryAt` is set using the backoff formula above.
- **completed** / **failed** — terminal (subject to manual retry, for `failed`).

Every transition is also appended to `job_events` (`queued`, `claimed`,
`completed`, `failed`, `reclaimed`, `retried`) — a full audit trail per job,
independent of the dashboard's live view.

> **Known gap:** nothing currently promotes a `delayed` job back to `queued`
> once `retryAt` elapses — there's no scheduler polling `retryAt` yet. The
> only paths back to `queued` today are the recovery sweep (for `in_flight`
> jobs orphaned by a dead worker) and the manual retry endpoint (for
> terminally `failed` jobs).

## Running it

### Prerequisites

- Node.js 20+
- Docker (for Postgres via `compose.yaml`)

### 1. Install dependencies

```bash
npm install
cd dashboard && npm install && cd ..
```

### 2. Configure environment

The root `.env` already has working defaults for local dev:

```
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=job_monitor
DB_PORT=5435
DB_URL=postgresql://myuser:mypassword@localhost:5435/job_monitor
```

### 3. Start Postgres

```bash
docker compose up -d
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Start the server (API + WebSocket + producer + workers + recovery)

```bash
npm run dev      # tsx --watch, restarts on file changes
# or
npm start        # tsx, no watch
```

This single command boots everything described in the architecture diagram
above: the REST API and WebSocket server on `http://localhost:3000`, the
demo producer, `worker-A`, `worker-B`, and the recovery loop.

### 6. Start the dashboard

```bash
cd dashboard
npm run dev
```

Vite serves it at `http://localhost:5173`. The dashboard's REST base URL and
WebSocket URL are currently hardcoded to `localhost:3000`
(`dashboard/api/client.ts`, `dashboard/src/webSocket/client.ts`) — if you run
the server elsewhere, update those two files.

## API reference

| Method | Path | Description |
|---|---|---|
| GET | `/jobs/in-flight` | Jobs currently being processed. |
| GET | `/jobs/completed` | Last 100 completed jobs. |
| GET | `/jobs/failed` | All terminally failed jobs. |
| POST | `/jobs/:id/retry` | Move a `failed` job back to `queued`. 404 if not found, 400 if not currently `failed`. |
| GET | `/queue/depth` | Count of `queued` jobs, grouped by job `type`. |
| GET | `/workers` | All workers with their status and last heartbeat. |

## WebSocket events

Connect to `ws://localhost:3000`. On connect you get a `{ type: "connected" }`
welcome message, then a live stream of:

`job.enqueued`, `job.claimed`, `job.completed`, `job.failed`,
`job.reclaimed`, `worker.updated`

(see `src/websocket/events.ts` for the exact payload shapes consumed by
`dashboard/src/webSocket/client.ts`).

## Usage examples

### 1. Enqueue a batch of jobs

The demo producer only ever enqueues 5 fixed sample jobs, once, and there's
no REST endpoint for creating jobs — `enqueueJob()` is a service function.
To push a batch through the real pipeline (DB insert + `job_events` row +
live `job.enqueued` broadcast), run a one-off script against the running
server's database with `tsx`:

```bash
cat > /tmp/enqueue-batch.ts <<'EOF'
import "dotenv/config";
import { enqueueJob } from "./src/services/queue.js";

for (let i = 0; i < 10; i++) {
  await enqueueJob("sendEmail", { to: `user${i}@example.com` }, "normal");
}
console.log("Enqueued 10 jobs");
process.exit(0);
EOF

npx tsx /tmp/enqueue-batch.ts
```

Watch `/queue/depth` (or the dashboard's queue panel) update immediately —
`worker-A` / `worker-B` will start draining the batch right away.

### 2. Simulate a dead worker and watch reclaim

Because `worker-A` and `worker-B` currently run inside the same Node process
as the server (see [Architecture](#architecture)), you can't `kill -9` just
one without taking down the whole server. The practical way to exercise the
reclaim path without doing that is to force a worker's heartbeat to look
stale directly in Postgres — this is exactly the condition the recovery
sweep checks for:

```bash
docker compose exec db psql -U myuser -d job_monitor -c \
  "UPDATE workers SET last_heartbeat = now() - interval '31 seconds' WHERE id = 'worker-B';"
```

Within 5 seconds (the recovery sweep interval), `worker-B` flips to `dead`
and any job it currently holds `in_flight` is set back to `queued` — you'll
see `worker.updated` and `job.reclaimed` events on the dashboard, and
`worker-A` (or `worker-B`, once its own heartbeat loop overwrites the
timestamp again) will pick the job back up.

If you do want to fully stop a worker process (accepting that the whole
server stops with it, per the caveat above), just `Ctrl+C` the `npm run dev`
process — after 30s, recovery on a *restarted* server will mark both workers
dead and requeue anything left `in_flight`.

### 3. Retry a failed job

First find a failed job:

```bash
curl -s http://localhost:3000/jobs/failed | jq '.[0].id'
```

Then retry it:

```bash
curl -X POST http://localhost:3000/jobs/<job-id>/retry
```

The job moves from `failed` back to `queued` (retry count, error, and
timestamps are cleared), a `retried` row is appended to `job_events`, and a
worker will claim it again on its next poll. The dashboard's Failed Jobs
panel calls this same endpoint when you click "Retry" (see
`dashboard/src/components/FailedJobs.tsx`).

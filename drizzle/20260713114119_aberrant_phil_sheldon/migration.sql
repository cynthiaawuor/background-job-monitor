CREATE TYPE "job_event" AS ENUM('queued', 'claimed', 'completed', 'failed', 'reclaimed', 'retried');--> statement-breakpoint
CREATE TYPE "job_priority" AS ENUM('high', 'normal');--> statement-breakpoint
CREATE TYPE "job_state" AS ENUM('queued', 'in_flight', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "worker_status" AS ENUM('alive', 'dead');--> statement-breakpoint
CREATE TABLE "job_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"job_id" uuid NOT NULL,
	"worker_id" text,
	"event" "job_event" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"priority" "job_priority" DEFAULT 'normal'::"job_priority" NOT NULL,
	"state" "job_state" DEFAULT 'queued'::"job_state" NOT NULL,
	"worker_id" text,
	"error" text,
	"stack_trace" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" text PRIMARY KEY,
	"status" "worker_status" DEFAULT 'alive'::"worker_status" NOT NULL,
	"last_heartbeat" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_events" ADD CONSTRAINT "job_events_job_id_jobs_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_worker_id_workers_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE SET NULL;
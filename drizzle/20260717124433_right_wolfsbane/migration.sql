ALTER TYPE "job_state" ADD VALUE 'delayed' BEFORE 'completed';--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "retry_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "max_retry" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "retry_at" timestamp;
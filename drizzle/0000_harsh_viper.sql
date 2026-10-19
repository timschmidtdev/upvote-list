CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar(280) NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"ip_hash" text NOT NULL,
	"action" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_ip_hash_action_window_start_pk" PRIMARY KEY("ip_hash","action","window_start")
);
--> statement-breakpoint
CREATE INDEX "questions_votes_created_idx" ON "questions" USING btree ("votes" desc,"created_at" desc);
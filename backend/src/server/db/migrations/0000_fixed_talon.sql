CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

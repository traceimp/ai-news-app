CREATE TABLE "articles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "articles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"original_url" text NOT NULL,
	"original_title" text NOT NULL,
	"title_ko" text NOT NULL,
	"summary_ko" text NOT NULL,
	"category_id" integer,
	"published_at" timestamp with time zone,
	"notion_page_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_user_url_unique" UNIQUE("user_id","original_url")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_user_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_user_published_idx" ON "articles" USING btree ("user_id","published_at");
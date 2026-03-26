import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres.sbkjrotvowssoinmuhgm:xet4MUQqnv0yudqpq@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  },
  schemaFilter: ["public"],
});

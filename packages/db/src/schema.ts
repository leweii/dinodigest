import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  real,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ============================================================
// devices — anonymous user identification via cookie
// ============================================================

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  locale: varchar("locale", { length: 10 }).default("en").notNull(),
  config: jsonb("config").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// articles — each submitted URL becomes an article
// ============================================================

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: uuid("device_id")
    .references(() => devices.id)
    .notNull(),
  sourceUrl: text("source_url").notNull(),
  title: text("title"),
  rawContent: text("raw_content"),
  language: varchar("language", { length: 10 }),
  wordCount: integer("word_count"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  // status: 'pending' → 'processing' → 'done' | 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// digests — each module produces outputs for an article
// ============================================================

export const digests = pgTable("digests", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id")
    .references(() => articles.id)
    .notNull(),
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  kind: varchar("kind", { length: 30 }).notNull(),
  // kind: 'summary' | 'key_point' | 'flashcard' | 'quiz'
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// flashcards — extracted for independent review lifecycle (SM-2)
// ============================================================

export const flashcards = pgTable("flashcards", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: uuid("device_id")
    .references(() => devices.id)
    .notNull(),
  articleId: uuid("article_id")
    .references(() => articles.id)
    .notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  tags: text("tags").array(),
  // SM-2 spaced repetition fields
  repetitions: integer("repetitions").default(0).notNull(),
  easeFactor: real("ease_factor").default(2.5).notNull(),
  interval: integer("interval").default(0).notNull(), // days
  nextReviewAt: timestamp("next_review_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// Type exports for use in application code
// ============================================================

export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export type Digest = typeof digests.$inferSelect;
export type NewDigest = typeof digests.$inferInsert;

export type Flashcard = typeof flashcards.$inferSelect;
export type NewFlashcard = typeof flashcards.$inferInsert;

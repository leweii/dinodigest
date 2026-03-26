import { createDB } from "@dinodigest/db";
import { Queue } from "bullmq";
import IORedis from "ioredis";

// Singleton database connection
let _db: ReturnType<typeof createDB> | null = null;
export function getDB() {
  if (!_db) {
    _db = createDB();
  }
  return _db;
}

// Singleton Redis connection for queue
let _redis: IORedis | null = null;
function getRedis() {
  if (!_redis) {
    _redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
  }
  return _redis;
}

// Singleton digest queue
let _queue: Queue | null = null;
export function getDigestQueue() {
  if (!_queue) {
    _queue = new Queue("digest", { connection: getRedis() });
  }
  return _queue;
}

// Device cookie name
export const DEVICE_COOKIE = "dino_device_id";

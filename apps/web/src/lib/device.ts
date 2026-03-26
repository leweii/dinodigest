import { cookies } from "next/headers";
import { devices } from "@dinodigest/db";
import { eq } from "drizzle-orm";
import { getDB, DEVICE_COOKIE } from "./server";

/**
 * Get or create the anonymous device for the current request.
 * Uses a cookie to track the device across sessions.
 */
export async function getOrCreateDevice(): Promise<string> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(DEVICE_COOKIE)?.value;

  if (existingId) {
    // Verify it exists in DB
    const db = getDB();
    const device = await db.query.devices.findFirst({
      where: eq(devices.id, existingId),
      columns: { id: true },
    });
    if (device) return device.id;
  }

  // Create new device
  const db = getDB();
  const [newDevice] = await db.insert(devices).values({}).returning({ id: devices.id });

  // Set cookie (1 year)
  cookieStore.set(DEVICE_COOKIE, newDevice.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });

  return newDevice.id;
}

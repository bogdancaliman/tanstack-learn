import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { user, session, account } from "../db/schema";
import type { AuthVariables } from "../lib/requireAuth";

export async function listUsers(c: Context<{ Variables: AuthVariables }>) {
  const currentUser = c.get("user");
  return c.json([currentUser]);
}

export async function getUserById(c: Context<{ Variables: AuthVariables }>) {
  const id = c.req.param("id");
  const currentUser = c.get("user");
  if (id !== currentUser.id) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const rows = await db.select().from(user).where(eq(user.id, id));
  if (rows.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json(rows[0]);
}

export async function updateUser(c: Context<{ Variables: AuthVariables }>) {
  const id = c.req.param("id");
  const currentUser = c.get("user");
  if (id !== currentUser.id) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const body = await c.req.json<{ name?: string; image?: string }>();

  const existing = await db.select().from(user).where(eq(user.id, id));
  if (existing.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const updates: { name?: string; image?: string } = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.image !== undefined) updates.image = body.image;

  if (Object.keys(updates).length === 0) {
    return c.json(existing[0]);
  }

  await db.update(user).set(updates).where(eq(user.id, id));
  const [updated] = await db.select().from(user).where(eq(user.id, id));
  return c.json(updated);
}

export async function deleteUser(c: Context<{ Variables: AuthVariables }>) {
  const id = c.req.param("id");
  const currentUser = c.get("user");
  if (id !== currentUser.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const existing = await db.select().from(user).where(eq(user.id, id));
  if (existing.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  await db.delete(session).where(eq(session.userId, id));
  await db.delete(account).where(eq(account.userId, id));
  await db.delete(user).where(eq(user.id, id));

  return c.json({ success: true });
}

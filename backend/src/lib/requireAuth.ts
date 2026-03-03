import type { Context, Next } from "hono";
import { auth } from "./auth";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthVariables = { user: AuthUser };

export async function requireAuth(c: Context<{ Variables: AuthVariables }>, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", session.user as AuthUser);
  await next();
}

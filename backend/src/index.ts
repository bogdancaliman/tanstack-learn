import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { requireAuth } from "./lib/requireAuth";
import * as userHandlers from "./handlers/users";
import type { AuthVariables } from "./lib/requireAuth";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["GET", "POST"], "/api/auth/*", async (c) =>
  auth.handler(c.req.raw),
);

// User CRUD (auth required, self-only)
const users = new Hono<{ Variables: AuthVariables }>();
users.use("*", requireAuth);
users.get("/", userHandlers.listUsers);
users.get("/:id", userHandlers.getUserById);
users.patch("/:id", userHandlers.updateUser);
users.delete("/:id", userHandlers.deleteUser);
app.route("/api/users", users);

export default app;

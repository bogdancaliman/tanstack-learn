import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import * as userHandlers from "./handlers/users";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["GET", "POST"], "/api/auth/*", async (c) =>
  auth.handler(c.req.raw),
);

// User CRUD
app.get("/api/users", userHandlers.listUsers);
app.get("/api/users/:id", userHandlers.getUserById);
app.patch("/api/users/:id", userHandlers.updateUser);
app.delete("/api/users/:id", userHandlers.deleteUser);

export default app;

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "weekndr_session";
const SESSION_DAYS = 30;

export type User = {
  id: number;
  email: string;
  name: string;
  is_paid: boolean;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const pool = await db();
  await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
    hashToken(token),
    userId,
    expires,
  ]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    const pool = await db();
    await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  store.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const pool = await db();
  const { rows } = await pool.query<User>(
    `SELECT u.id, u.email, u.name, u.is_paid
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

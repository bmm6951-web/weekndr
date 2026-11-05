"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { db } from "@/lib/db";

export type AuthState = { error?: string; email?: string; name?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Please enter your name.", email, name };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", email, name };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", email, name };

  const pool = await db();
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [email, name, hash],
  );
  if (rows.length === 0) {
    return { error: "An account with that email already exists. Try logging in.", email, name };
  }

  await createSession(rows[0].id);
  redirect("/dashboard");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const pool = await db();
  const { rows } = await pool.query<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Incorrect email or password.", email };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

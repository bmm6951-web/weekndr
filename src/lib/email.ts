// Sends email through Resend. Without a verified domain, Resend only delivers
// to the address the Resend account was created with.
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  const base = process.env.RESEND_BASE_URL ?? "https://api.resend.com"; // overridable for local testing
  const res = await fetch(`${base}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ALERTS_FROM_EMAIL ?? "Weekndr <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
}

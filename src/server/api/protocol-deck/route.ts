import { Resend } from "resend";
import {
  PROTOCOL_PITCH_DECK_TO_EMAIL,
  RATE_LIMIT_PROTOCOL_DECK_MAX,
  RATE_LIMIT_WINDOW_MS,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
} from "astro:env/server";
import { buildRateLimitHeaders, checkRateLimit, getRateLimitConfig } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;

function badRequest(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: "api:protocol-deck",
      max: RATE_LIMIT_PROTOCOL_DECK_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    }),
  );

  if (!rateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        error: "Too many requests. Please try again in a moment.",
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  }

  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return badRequest("Invalid request payload.");
  }

  const companyName =
    payload && typeof payload === "object" && "companyName" in payload
      ? String(payload.companyName ?? "").trim()
      : "";
  const email =
    payload && typeof payload === "object" && "email" in payload
      ? String(payload.email ?? "").trim()
      : "";

  if (!companyName) {
    return badRequest("Company name is required.");
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return badRequest("A valid email is required.");
  }

  const resendApiKey = RESEND_API_KEY?.trim();
  const fromEmail = RESEND_FROM_EMAIL.trim();
  const toEmail = PROTOCOL_PITCH_DECK_TO_EMAIL.trim();

  if (!resendApiKey) {
    return badRequest("Email service is not configured.", 500);
  }

  if (!fromEmail) {
    return badRequest("Sender email is not configured.", 500);
  }

  const resend = new Resend(resendApiKey);

  try {
    const safeCompanyName = escapeHtml(companyName);
    const safeEmail = escapeHtml(email);

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `Kuest Protocol deck request — ${companyName}`,
      text: [
        "New pitch deck request from /protocol",
        "",
        `Company: ${companyName}`,
        `Email: ${email}`,
      ].join("\n"),
      html: [
        "<h1>New pitch deck request</h1>",
        "<p>Request submitted from the <strong>/protocol</strong> page.</p>",
        `<p><strong>Company:</strong> ${safeCompanyName}</p>`,
        `<p><strong>Email:</strong> ${safeEmail}</p>`,
      ].join(""),
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Failed to send email.", 500);
  }

  return Response.json({ ok: true });
}

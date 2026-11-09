const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAGE_SIZE = 500;
const BATCH_SIZE = 100;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 20_000;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Sign in with an administrator account." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !resendApiKey || !fromEmail) {
    console.error("Newsletter email service is not fully configured.");
    return jsonResponse({ error: "Newsletter email is not configured. Check the Supabase function secrets." }, 500);
  }

  let authResponse: Response;
  try {
    authResponse = await fetch(new URL("/auth/v1/user", supabaseUrl), {
      headers: { apikey: anonKey, Authorization: authorization },
    });
  } catch {
    return jsonResponse({ error: "Could not verify the administrator session. Please try again." }, 502);
  }
  if (!authResponse.ok) {
    return jsonResponse({ error: "Your session is invalid or expired. Sign in again." }, 401);
  }

  let user: { id?: string };
  try {
    user = await authResponse.json();
  } catch {
    return jsonResponse({ error: "Could not verify the administrator session." }, 502);
  }
  if (!user.id) {
    return jsonResponse({ error: "Could not verify the administrator account." }, 401);
  }

  const adminUrl = new URL("/rest/v1/admin_users", supabaseUrl);
  adminUrl.searchParams.set("select", "user_id");
  adminUrl.searchParams.set("user_id", `eq.${user.id}`);
  let adminResponse: Response;
  try {
    adminResponse = await fetch(adminUrl, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
  } catch {
    return jsonResponse({ error: "Could not verify administrator permissions." }, 502);
  }
  if (!adminResponse.ok) {
    console.error("Administrator permission lookup failed:", adminResponse.status);
    return jsonResponse({ error: "Could not verify administrator permissions." }, 502);
  }
  let admins: Array<{ user_id: string }>;
  try {
    admins = await adminResponse.json();
  } catch {
    return jsonResponse({ error: "Could not verify administrator permissions." }, 502);
  }
  if (!admins.some((admin) => admin.user_id === user.id)) {
    return jsonResponse({ error: "This account is not authorized to send newsletter email." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({ error: "Request body must be a JSON object." }, 400);
  }
  const payload = body as { subject?: unknown; message?: unknown };
  const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!subject || subject.length > MAX_SUBJECT_LENGTH || /[\r\n]/.test(subject)) {
    return jsonResponse({ error: `Subject is required and must be no more than ${MAX_SUBJECT_LENGTH} characters.` }, 400);
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: `Message is required and must be no more than ${MAX_MESSAGE_LENGTH} characters.` }, 400);
  }

  const subscriberUrl = new URL("/rest/v1/newsletter_subscribers", supabaseUrl);
  subscriberUrl.searchParams.set("select", "id,email");
  subscriberUrl.searchParams.set("order", "id.asc");

  let firstPageResponse: Response;
  try {
    firstPageResponse = await fetch(subscriberUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
        Range: `0-${PAGE_SIZE - 1}`,
      },
    });
  } catch {
    return jsonResponse({ error: "Could not load the subscriber list." }, 502);
  }
  if (!firstPageResponse.ok) {
    console.error("Subscriber list query failed:", firstPageResponse.status);
    return jsonResponse({ error: "Could not load the subscriber list." }, 502);
  }

  const contentRange = firstPageResponse.headers.get("content-range");
  const total = contentRange?.split("/")[1];
  if (!total || total === "*") {
    return jsonResponse({ error: "Could not determine the subscriber count. Please try again." }, 502);
  }
  const totalSubscribers = Number(total);
  if (!Number.isSafeInteger(totalSubscribers) || totalSubscribers < 0) {
    return jsonResponse({ error: "The subscriber count returned by the database is invalid." }, 502);
  }
  if (totalSubscribers === 0) {
    return jsonResponse({ sent: 0, failed: 0, notAttempted: 0 });
  }

  let sent = 0;
  let failed = 0;
  let notAttempted = 0;
  let page: Array<{ id: string; email: string }>;
  try {
    page = await firstPageResponse.json();
  } catch {
    return jsonResponse({ error: "Could not read the subscriber list." }, 502);
  }

  const htmlMessage = escapeHtml(message).replace(/\r\n|\r|\n/g, "<br>");
  const footerText = "You are receiving this because you subscribed to PearlHub updates. To unsubscribe, email pearlhubweb@gmail.com.";
  const text = `${message}\n\n---\n${footerText}`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:normal">${htmlMessage}</div><hr><p style="font-size:12px;color:#666">${escapeHtml(footerText)}</p>`;

  for (let offset = 0; offset < totalSubscribers; offset += PAGE_SIZE) {
    if (offset > 0) {
      let pageResponse: Response;
      try {
        pageResponse = await fetch(subscriberUrl, {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Range: `${offset}-${offset + PAGE_SIZE - 1}`,
          },
        });
      } catch {
        notAttempted = totalSubscribers - offset;
        return jsonResponse({ sent, failed, notAttempted, error: "Could not load the remaining subscribers." });
      }
      if (!pageResponse.ok) {
        console.error("Subscriber page query failed:", pageResponse.status);
        notAttempted = totalSubscribers - offset;
        return jsonResponse({ sent, failed, notAttempted, error: "Could not load the remaining subscribers." });
      }
      try {
        page = await pageResponse.json();
      } catch {
        notAttempted = totalSubscribers - offset;
        return jsonResponse({ sent, failed, notAttempted, error: "Could not read the remaining subscribers." });
      }
    }

    const validEmails = page.filter((subscriber) =>
      typeof subscriber.email === "string"
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriber.email),
    );
    failed += page.length - validEmails.length;
    for (let index = 0; index < validEmails.length; index += BATCH_SIZE) {
      const batch = validEmails.slice(index, index + BATCH_SIZE);
      let resendResponse: Response;
      try {
        resendResponse = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify(batch.map((subscriber) => ({
            from: fromEmail,
            to: [subscriber.email],
            subject,
            text,
            html,
            headers: { "List-Unsubscribe": "<mailto:pearlhubweb@gmail.com?subject=Unsubscribe>" },
          }))),
        });
      } catch {
        failed += batch.length;
        notAttempted = totalSubscribers - offset - page.length + validEmails.length - index - batch.length;
        return jsonResponse({ sent, failed, notAttempted, error: "The email provider could not be reached. Check the Resend logs before retrying." });
      }
      if (!resendResponse.ok) {
        console.error("Newsletter batch delivery failed:", resendResponse.status, await resendResponse.text());
        failed += batch.length;
        notAttempted = totalSubscribers - offset - page.length + validEmails.length - index - batch.length;
        return jsonResponse({ sent, failed, notAttempted, error: "The email provider rejected a batch. Check the Resend logs before retrying." });
      }
      let result: { data?: unknown[] };
      try {
        result = await resendResponse.json();
      } catch {
        failed += batch.length;
        notAttempted = totalSubscribers - offset - page.length + validEmails.length - index - batch.length;
        return jsonResponse({ sent, failed, notAttempted, error: "The email provider returned an unreadable result. Check the Resend logs before retrying." });
      }
      if (!Array.isArray(result.data) || result.data.length !== batch.length) {
        failed += batch.length;
        notAttempted = totalSubscribers - offset - page.length + validEmails.length - index - batch.length;
        return jsonResponse({ sent, failed, notAttempted, error: "The email provider returned an incomplete batch result. Check the Resend logs before retrying." });
      }
      sent += batch.length;
    }
  }

  return jsonResponse({ sent, failed, notAttempted });
});

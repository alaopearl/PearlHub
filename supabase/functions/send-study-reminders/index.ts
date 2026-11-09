const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const cronSecret = Deno.env.get("REMINDER_CRON_SECRET");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://pearlhub.com";

  if (!cronSecret || !serviceRoleKey || !supabaseUrl || !resendApiKey || !fromEmail || !siteUrl) {
    console.error("Study reminder secrets are not fully configured.");
    return jsonResponse({ error: "Reminder service is not configured" }, 500);
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const restHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
  const dueResponse = await fetch(new URL("/rest/v1/rpc/claim_due_study_reminders", supabaseUrl), {
    method: "POST",
    headers: restHeaders,
    body: JSON.stringify({ p_limit: 100 }),
  });
  if (!dueResponse.ok) {
    console.error("Could not load due study reminders:", await dueResponse.text());
    return jsonResponse({ error: "Could not load due reminders" }, 502);
  }

  const dueReminders: Array<{ id: string; title: string; email: string; reminder_at: string }> =
    await dueResponse.json();
  let sent = 0;
  const failures: string[] = [];

  for (const reminder of dueReminders) {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [reminder.email],
        subject: `PearlHub study reminder: ${reminder.title}`,
        text: `This is your PearlHub reminder: ${reminder.title}\n\nOpen your Study Space: ${siteUrl.replace(/\/+$/, "")}/study`,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error(`Email delivery failed for reminder ${reminder.id}:`, errorText);
      failures.push(reminder.id);
      const releaseResponse = await fetch(
        new URL(`/rest/v1/study_reminders?id=eq.${encodeURIComponent(reminder.id)}`, supabaseUrl),
        {
          method: "PATCH",
          headers: { ...restHeaders, Prefer: "return=minimal" },
          body: JSON.stringify({ claimed_at: null }),
        },
      );
      if (!releaseResponse.ok) {
        console.error(`Could not release reminder ${reminder.id} for retry:`, await releaseResponse.text());
      }
      continue;
    }

    const updateResponse = await fetch(
      new URL(`/rest/v1/study_reminders?id=eq.${encodeURIComponent(reminder.id)}&sent_at=is.null`, supabaseUrl),
      {
        method: "PATCH",
        headers: { ...restHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ sent_at: new Date().toISOString(), claimed_at: null }),
      },
    );
    if (!updateResponse.ok) {
      console.error(`Could not mark reminder ${reminder.id} as sent:`, await updateResponse.text());
      failures.push(reminder.id);
      continue;
    }
    sent += 1;
  }

  return jsonResponse(
    { sent, failed: failures.length, failedReminderIds: failures },
    failures.length ? 502 : 200,
  );
});

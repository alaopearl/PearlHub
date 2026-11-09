# PearlHub

PearlHub is a React and Vite media platform for technology, education, tools, and community content.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase setup

Apply the migrations in order, including:

- `20260101000400_admin_auth.sql`
- `20260101000500_student_features.sql`
- `20260101000600_student_ai_tutor.sql`

In Supabase Authentication settings, enable email/password sign-up and configure the site URL and redirect URLs for your deployed site and local development. Student Study Space remains usable in guest mode; signing in syncs its plan to that student's account.

### AI Assignment Tutor

The Study Space includes an optional, sign-in-only tutor for assignment text and JPG, PNG, or WebP photos. It returns a worked explanation, and PearlHub does not save submitted assignment text or images. Submissions are sent to Google Gemini for processing; students should avoid including personal or sensitive information and verify important answers. Each account is limited to 20 tutor requests per UTC day.

To enable it:

1. Apply `20260101000600_student_ai_tutor.sql` after the earlier migrations.
2. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey) and set it as a Supabase Edge Function secret (never put it in a `VITE_` variable or commit it):
   ```bash
   npx supabase secrets set GEMINI_API_KEY=your-gemini-api-key
   ```
   Configure appropriate API quotas and billing controls for the Google Cloud project as an additional cost safeguard.
3. Deploy the function:
   ```bash
   npx supabase functions deploy solve-assignment
   ```

The function validates the student's Supabase session, enforces the daily account limit, and calls Google Gemini from the server. It uses the `gemini-3.6-flash` model for text and image input.

### Admin newsletter email

The Admin Portal's **Send email** tab sends a plain-text newsletter message to the current `newsletter_subscribers` list. Each subscriber receives an individual email. The function verifies the caller's Supabase session and admin allowlist membership before reading recipients. Email is sent through Resend using the `RESEND_API_KEY` and `REMINDER_FROM_EMAIL` secrets configured for scheduled reminders; configure those secrets and verify the sender domain before use.

Deploy the function after linking and logging into the Supabase project:

```bash
npx supabase functions deploy send-newsletter
```

The admin portal confirms the current subscriber count before sending. Emails include a mailto unsubscribe instruction; admins can remove unsubscribe requests in the Subscribers tab.

### Scheduled email reminders

Email delivery is optional and requires a Resend account with a verified sender domain:

1. Deploy the Edge Function:
   ```bash
   npx supabase functions deploy send-study-reminders
   ```
2. Set the function secrets (never commit these values):
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_... REMINDER_FROM_EMAIL="PearlHub <reminders@your-verified-domain>"
   npx supabase secrets set REMINDER_CRON_SECRET="$(openssl rand -hex 32)" PUBLIC_SITE_URL=https://www.example.com
   ```
   Also set `SUPABASE_SERVICE_ROLE_KEY` if it is not already available in the function environment.
3. Add GitHub repository Actions secrets named `SUPABASE_URL` and `REMINDER_CRON_SECRET`. The secret must exactly match the function secret.
4. Enable GitHub Actions for the repository. The workflow invokes the function every 15 minutes; use **Actions → Send scheduled study reminders → Run workflow** to test it.

The function claims due reminders before sending so overlapping scheduled runs do not normally send duplicates. Browser notifications are separate and only fire while PearlHub is open in a browser that has granted notification permission.

## Search engine indexing

Set `VITE_SITE_URL` to the canonical production origin (for example, `https://www.example.com`) in the deployment environment. This is used for canonical metadata and sitemap generation.

The production build generates `public/sitemap.xml` from bundled article and tool slugs and writes `public/robots.txt`. If admins add content after deployment, rebuild and redeploy to refresh the static sitemap.

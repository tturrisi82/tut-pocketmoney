# Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Settings > API

## 2. Configure Environment Variables

Edit `.env.local` (already created, gitignored):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run Database Migrations

In the Supabase Dashboard, go to **SQL Editor** and run each migration file in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_triggers.sql`

## 4. Create User Accounts

In Supabase Dashboard > **Authentication > Users**, create two users using the "Create user" button. You must pass metadata via the SQL editor or API (the Dashboard UI doesn't support custom metadata). Run in SQL Editor:

```sql
-- Create parent account
select auth.create_user(
  uid := gen_random_uuid(),
  email := 'parent@example.com',
  password := 'your-password',
  email_confirm := true,
  raw_user_meta_data := '{"role": "parent", "display_name": "Dad"}'::jsonb
);

-- Create Luca's account
select auth.create_user(
  uid := gen_random_uuid(),
  email := 'luca@example.com',
  password := 'your-password',
  email_confirm := true,
  raw_user_meta_data := '{"role": "child", "display_name": "Luca"}'::jsonb
);
```

## 5. Set Up WhatsApp Notifications (Callmebot)

1. Send the message `I allow callmebot to send me messages` from your WhatsApp to **+34 644 97 44 91**
2. Callmebot will reply with your API key
3. In Supabase Dashboard > **Settings > Edge Functions**, add these secrets:
   - `PARENT_PHONE` = your WhatsApp number (e.g. `+447700900123`)
   - `CALLMEBOT_API_KEY` = the key from step 2
   - `APP_URL` = your deployed app URL (e.g. `https://your-app.netlify.app`)

## 6. Deploy the Edge Function

Install the Supabase CLI and run:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy notify-parent
```

## 7. Create the Database Webhook

In Supabase Dashboard > **Database > Webhooks**, create a new webhook:

- **Name**: notify-parent-on-completion
- **Table**: `chore_instances`
- **Events**: Update
- **URL**: `https://<your-project-ref>.supabase.co/functions/v1/notify-parent`
- **HTTP Headers**: `Authorization: Bearer <your-service-role-key>`

## 8. Deploy to Netlify

1. Push this repo to GitHub
2. Connect the repo in Netlify Dashboard
3. Set build command: `npm run build`, publish directory: `dist`
4. Add environment variables in Netlify: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy!

## 9. Regenerate TypeScript Types (Optional)

Once you have a real project, replace the manual types:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.types.ts
```

## Local Development

```bash
npm install
npm run dev
```

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
const APP_URL = Deno.env.get("APP_URL") ?? "";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: { record?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const instance = payload.record;
  if (!instance || instance["status"] !== "pending_approval") {
    return new Response("OK", { status: 200 });
  }

  const instanceId = instance["id"] as string;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Idempotency check: skip only if we already notified AND the completed_at
  // hasn't changed since (i.e. this isn't a re-submission after an undo)
  const completedAt = instance["completed_at"] as string | null;
  const { data: existing } = await supabase
    .from("notification_log")
    .select("sent_at")
    .eq("chore_instance_id", instanceId)
    .eq("notification_type", "completion_pending")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && completedAt && existing.sent_at >= completedAt) {
    return new Response("Already notified", { status: 200 });
  }

  // Fetch chore title
  const { data: choreData } = await supabase
    .from("chores")
    .select("title")
    .eq("id", instance["chore_id"] as string)
    .single();

  const choreTitle = choreData?.title ?? "a chore";
  const dueDate = instance["due_date"] as string;

  // Send via Telegram
  const message = `Luca marked "${choreTitle}" as done on ${dueDate}. Open the app to review: ${APP_URL}/parent/review`;

  let success = true;
  let errorMessage: string | null = null;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );
    if (!response.ok) {
      success = false;
      errorMessage = `Telegram returned ${response.status}: ${await response.text()}`;
    }
  } catch (err) {
    success = false;
    errorMessage = String(err);
  }

  // Write to notification_log
  await supabase.from("notification_log").insert({
    chore_instance_id: instanceId,
    notification_type: "completion_pending",
    phone_to: `telegram:${TELEGRAM_CHAT_ID}`,
    success,
    error_message: errorMessage,
  });

  if (!success) {
    console.error("Notification failed:", errorMessage);
    return new Response("Notification failed", { status: 500 });
  }

  return new Response("Notified", { status: 200 });
});

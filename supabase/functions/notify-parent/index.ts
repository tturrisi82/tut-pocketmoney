import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PARENT_PHONE = Deno.env.get("PARENT_PHONE")!;
const CALLMEBOT_API_KEY = Deno.env.get("CALLMEBOT_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "";

Deno.serve(async (req) => {
  // Validate request method
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
    // Ignore non-relevant webhook events
    return new Response("OK", { status: 200 });
  }

  const instanceId = instance["id"] as string;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Idempotency check: skip if we already sent a notification for this instance
  const { data: existing } = await supabase
    .from("notification_log")
    .select("id")
    .eq("chore_instance_id", instanceId)
    .eq("notification_type", "completion_pending")
    .maybeSingle();

  if (existing) {
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

  // Build WhatsApp message
  const message = encodeURIComponent(
    `Luca marked "${choreTitle}" as done on ${dueDate}. Open the app to review: ${APP_URL}/parent/review`
  );

  // Send via Callmebot
  const callmebotUrl =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(PARENT_PHONE)}&text=${message}&apikey=${CALLMEBOT_API_KEY}`;

  let success = true;
  let errorMessage: string | null = null;

  try {
    const response = await fetch(callmebotUrl);
    if (!response.ok) {
      success = false;
      errorMessage = `Callmebot returned ${response.status}: ${await response.text()}`;
    }
  } catch (err) {
    success = false;
    errorMessage = String(err);
  }

  // Write to notification_log
  await supabase.from("notification_log").insert({
    chore_instance_id: instanceId,
    notification_type: "completion_pending",
    phone_to: PARENT_PHONE,
    success,
    error_message: errorMessage,
  });

  if (!success) {
    console.error("Notification failed:", errorMessage);
    return new Response("Notification failed", { status: 500 });
  }

  return new Response("Notified", { status: 200 });
});

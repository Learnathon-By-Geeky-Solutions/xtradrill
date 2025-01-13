import { Webhook } from "svix";
import { headers } from "next/headers";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

const validateWebhookSecret = () => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }
  return WEBHOOK_SECRET;
};

const validateHeaders = (headerPayload) => {
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error("No svix headers");
  }

  return { svix_id, svix_timestamp, svix_signature };
};

const verifyWebhook = async (WEBHOOK_SECRET, body, headers) => {
  const wh = new Webhook(WEBHOOK_SECRET);
  try {
    return wh.verify(body, headers);
  } catch (err) {
    console.error("Error verifying webhook:", err);
    throw new Error("Webhook verification failed");
  }
};

const handleUserCreationOrUpdate = async (data) => {
  const { id, first_name, last_name, image_url, email_addresses, username, primary_email_address_id } = data;
  
  const primaryEmail = email_addresses?.find(
    email => email?.id === primary_email_address_id
  )?.email_address ?? '';

  await createOrUpdateUser(
    id,
    first_name,
    last_name,
    image_url,
    primaryEmail,
    username
  );
};

export async function POST(req) {
  try {
    const WEBHOOK_SECRET = validateWebhookSecret();
    const headerPayload = headers();
    const { svix_id, svix_timestamp, svix_signature } = validateHeaders(headerPayload);

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const evt = await verifyWebhook(
      WEBHOOK_SECRET,
      body,
      {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }
    );

    if (!evt?.data) {
      return new Response("Invalid webhook data", { status: 400 });
    }

    const eventType = evt.type;
    console.log(`Webhook with an ID of ${evt.data.id} and type of ${eventType}`);
    console.log("Webhook body:", body);

    switch (eventType) {
      case "user.created":
      case "user.updated":
        await handleUserCreationOrUpdate(evt.data);
        return new Response(
          `User is ${eventType === "user.created" ? "created" : "updated"}`,
          { status: 200 }
        );

      case "user.deleted":
        await deleteUser(evt.data.id);
        return new Response("User is deleted", { status: 200 });

      default:
        return new Response("", { status: 200 });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(error.message || "Error occurred", { status: 400 });
  }
}
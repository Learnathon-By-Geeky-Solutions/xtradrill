import { Webhook } from "svix";
import { headers } from "next/headers";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", { status: 400 });
  }

  const { id } = evt?.data;
  const eventType = evt?.type;
  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses, username } = evt?.data;
    try {
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)?.email_address;
      
      console.log("Processing user data:", { id, first_name, last_name, image_url, primaryEmail, username });
      
      await createOrUpdateUser(
        id,
        first_name,
        last_name,
        image_url,
        primaryEmail,
        username
      );
      
      return new Response(`User is ${eventType === "user.created" ? "created" : "updated"}`, { status: 200 });
    } catch (error) {
      console.error("Error creating or updating user:", error);
      return new Response("Error occurred", { status: 400 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt?.data;
    try {
      await deleteUser(id);
      return new Response("User is deleted", { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error occurred", { status: 400 });
    }
  }

  return new Response("", { status: 200 });
}
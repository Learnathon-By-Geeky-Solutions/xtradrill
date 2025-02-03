import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the user's metadata to make them an admin
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: "admin",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error making user admin:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

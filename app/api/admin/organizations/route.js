import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Organization from "@/lib/models/organization";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the user is an admin
    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Connect to database
    await connect();

    // Get all organizations
    const organizations = await Organization.find().sort({ createdAt: -1 });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

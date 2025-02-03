import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Organization from "@/lib/models/organization";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the current user to access their email
    const user = await currentUser();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { companyName, companySize, industry } = await request.json();

    // Connect to database
    await connect();

    // Create organization request in database
    const organization = await Organization.create({
      name: companyName,
      userId,
      userEmail: user.emailAddresses[0].emailAddress,
      companySize,
      industry,
      status: "pending",
    });

    return NextResponse.json({ success: true, organizationId: organization._id });
  } catch (error) {
    console.error("Error creating organization:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

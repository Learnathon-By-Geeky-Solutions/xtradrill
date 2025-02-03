import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Organization from "@/lib/models/organization";

export async function GET(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clerkOrgId = searchParams.get("clerkOrgId");

    if (!clerkOrgId) {
      return new NextResponse("Missing clerkOrgId parameter", { status: 400 });
    }

    // Connect to database
    await connect();

    // Find organization by clerkOrgId
    const organization = await Organization.findOne({ clerkOrgId });
    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    return NextResponse.json({ status: organization.status });
  } catch (error) {
    console.error("Error fetching organization status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

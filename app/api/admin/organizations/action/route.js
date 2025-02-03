import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Organization from "@/lib/models/organization";

export async function POST(request) {
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

    const { organizationId, action } = await request.json();

    // Connect to database
    await connect();

    // Get the organization from MongoDB
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    if (action === "approve") {
      try {
        // Create organization in Clerk with initial admin member
        const clerkOrg = await clerkClient.organizations.createOrganization({
          name: organization.name,
          createdBy: organization.userId,
          privateMetadata: {
            companySize: organization.companySize,
            industry: organization.industry,
          },
          publicMetadata: {
            status: "approved",
            role: "employer",
          },
          members: [{
            userId: organization.userId,
            role: "admin"
          }]
        });

        // Update the user's role
        await clerkClient.users.updateUser(organization.userId, {
          publicMetadata: {
            organizationRole: "employer",
          },
        });

        // Update organization in MongoDB
        organization.status = "approved";
        organization.clerkOrgId = clerkOrg.id;
        await organization.save();

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("Clerk API Error:", error);
        
        // If we failed after creating the organization, try to clean it up
        if (organization.clerkOrgId) {
          try {
            await clerkClient.organizations.deleteOrganization(organization.clerkOrgId);
          } catch (deleteError) {
            console.error("Failed to clean up organization:", deleteError);
          }
        }
        
        return new NextResponse(error.message || "Failed to create organization in Clerk", { status: 500 });
      }
    } else if (action === "reject") {
      // Update organization status in MongoDB
      organization.status = "rejected";
      await organization.save();
      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error("Error processing organization action:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

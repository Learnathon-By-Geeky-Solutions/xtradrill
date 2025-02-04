import { auth } from "@clerk/nextjs";
import { connect } from "@/lib/mongodb/mongoose";
import User from "@/lib/models/userModel";
import Company from "@/lib/models/companyModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();
    
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== 'employer') {
      return NextResponse.json({ error: "Not an employer" }, { status: 403 });
    }

    const company = await Company.findOne({ owner: user._id });
    
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error in GET /api/company/me:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    await connectToDB();
    
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== 'employer') {
      return NextResponse.json({ error: "Not an employer" }, { status: 403 });
    }

    // Check if company already exists
    let company = await Company.findOne({ owner: user._id });
    
    if (company) {
      return NextResponse.json({ error: "Company already exists" }, { status: 400 });
    }

    // Create new company
    company = new Company({
      name: data.name,
      description: data.description,
      website: data.website,
      location: data.location,
      industry: data.industry,
      size: data.size,
      owner: user._id,
    });

    await company.save();

    // Update user with company reference
    user.company = company._id;
    await user.save();

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error in POST /api/company/me:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

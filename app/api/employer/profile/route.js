import { NextResponse } from 'next/server';
import { connect } from "@/lib/mongodb/mongoose";
import Employer from '@/lib/models/employerModel';
import { currentUser } from '@clerk/nextjs';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connect();

    // Find employer by contact email (since that's what we collect during registration)
    const employer = await Employer.findOne({ 
      contactEmail: user.emailAddresses[0].emailAddress,
      status: 'approved'
    });

    if (!employer) {
      return NextResponse.json(
        { success: false, message: 'Employer profile not found or not approved' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, employer });
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employer profile' },
      { status: 500 }
    );
  }
}

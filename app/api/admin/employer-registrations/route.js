import { NextResponse } from 'next/server';
import { connect } from "@/lib/mongodb/mongoose";
import Employer from '@/lib/models/employerModel';
import mongoose from 'mongoose';

// Get all employer registrations
export async function GET() {
  try {
    await connect();
    const registrations = await Employer.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

// Update registration status
export async function PUT(req) {
  try {
    const { registrationId, status } = await req.json();
    
    await connect();

    // Validate registrationId
    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid registration ID' },
        { status: 400 }
      );
    }
    
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const registration = await Employer.findByIdAndUpdate(
      registrationId,
      { status },
      { new: true }
    );

    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Registration ${status}`,
      registration 
    });

  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update registration',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

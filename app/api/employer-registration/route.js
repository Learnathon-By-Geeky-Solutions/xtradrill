import { NextResponse } from 'next/server';
import { connect } from "../../../lib/mongodb/mongoose";
import Employer from '@/lib/models/employerModel';

export async function POST(req) {
  try {
    const formData = await req.json();
    
    // Connect to MongoDB
    await connect();
    
    // Create new employer registration using the model
    const employer = await Employer.create(formData);

    return NextResponse.json({ 
      success: true, 
      message: 'Registration submitted successfully',
      registrationId: employer._id 
    });
   
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A registration with this email already exists' },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to submit registration' },
      { status: 500 }
    );
  }
}

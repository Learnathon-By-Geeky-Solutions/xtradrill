import { NextResponse } from 'next/server';
import axios from 'axios';

const HEYGEN_API_URL = 'https://api.heygen.com/v2';

export async function GET() {
  const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
  
  try {
    // Get available talking photos
    console.log('Fetching talking photos...');
    const talkingPhotosResponse = await axios.get(
      `${HEYGEN_API_URL}/talking_photo/list`,
      {
        headers: {
          'Authorization': `Bearer ${HEYGEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Get available voices
    console.log('Fetching voices...');
    const voicesResponse = await axios.get(
      `${HEYGEN_API_URL}/voice/list`,
      {
        headers: {
          'Authorization': `Bearer ${HEYGEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      talkingPhotos: talkingPhotosResponse.data,
      voices: voicesResponse.data,
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch HeyGen resources',
        details: error.response?.data || error.message,
        status: error.response?.status
      },
      { status: error.response?.status || 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import axios from 'axios';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2';

export async function POST(request) {
  try {
    const { text } = await request.json();

    // Create video using HeyGen API
    console.log('Creating video with text:', text);
    const response = await axios.post(
      `${HEYGEN_API_URL}/video/generate`,
      {
        "background": {
          "type": "color",
          "value": "#ffffff"
        },
        "clips": [
          {
            "avatar_id": process.env.HEYGEN_AVATAR_ID,
            "avatar_style": "normal",
            "input_text": text,
            "voice_id": process.env.HEYGEN_VOICE_ID,
            "scale": 1.5,
            "position": "center"
          }
        ],
        "ratio": "16:9",
        "test": false,
        "version": "v1"
      },
      {
        headers: {
          'Authorization': `Bearer ${HEYGEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Video generation response:', response.data);
    const videoId = response.data.data.video_id;

    // Poll for video status
    let videoStatus;
    let attempts = 0;
    const maxAttempts = 30; // Maximum polling attempts

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Checking video status (attempt ${attempts})...`);
      
      videoStatus = await axios.get(
        `${HEYGEN_API_URL}/videos/${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${HEYGEN_API_KEY}`,
          },
        }
      );

      if (videoStatus.data.data.status === 'completed') {
        console.log('Video generation completed');
        return NextResponse.json({
          status: 'completed',
          video_url: videoStatus.data.data.video_url,
        });
      }

      if (videoStatus.data.data.status === 'failed') {
        console.error('Video generation failed');
        return NextResponse.json(
          { error: 'Video generation failed' },
          { status: 500 }
        );
      }

      // Wait for 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json(
      { error: 'Video generation timeout' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error generating video:', error.response?.data || error);
    return NextResponse.json(
      { 
        error: 'Failed to generate video',
        details: error.response?.data || error.message
      },
      { status: 500 }
    );
  }
}

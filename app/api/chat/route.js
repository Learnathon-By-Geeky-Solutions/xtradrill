import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful and friendly AI assistant. Keep your responses concise and conversational."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150, // Keep responses shorter for better voice interaction
    });

    const aiMessage = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      message: aiMessage
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    // Generate initial greeting and question using GPT-4
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a technical interviewer conducting an interview for an AI Application Developer position.
          You are evaluating the candidate's expertise in:
          - AI/ML frameworks and technologies
          - Large Language Models (LLMs) and their applications
          - API integration and development
          - Full-stack development with AI components
          
          Start with a friendly greeting and ask an initial technical question.
          Keep your responses concise and natural.
          Focus on practical experience and technical knowledge.`
        }
      ],
      model: "gpt-4",
    });

    const question = completion.choices[0].message.content;

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
  }
}

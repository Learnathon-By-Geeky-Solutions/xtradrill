import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { history } = await request.json();

    // Generate final evaluation using GPT-4
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer and evaluator. Review the complete interview conversation and provide:
          1. A score out of 100
          2. Detailed feedback on:
             - Communication skills
             - Technical knowledge
             - Problem-solving ability
             - Cultural fit
          Format your response as JSON with the following structure:
          {
            "score": number,
            "feedback": {
              "communication": string,
              "technical": string,
              "problemSolving": string,
              "culturalFit": string,
              "overall": string
            }
          }`
        },
        {
          role: "user",
          content: `Interview conversation: ${JSON.stringify(history)}`
        }
      ],
      model: "gpt-4",
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error ending interview:', error);
    return NextResponse.json({ error: 'Failed to end interview' }, { status: 500 });
  }
}

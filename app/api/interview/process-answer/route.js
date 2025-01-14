import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { answer, history } = await request.json();

    // Generate interviewer's response using GPT-4
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional interviewer conducting a job interview.
          Review the conversation history and the candidate's latest answer.
          Provide a relevant follow-up question based on their response.
          Keep your responses concise and natural.
          Focus on evaluating their skills and experience.`
        },
        ...history.map(item => ({
          role: item.role === 'interviewer' ? 'assistant' : 'user',
          content: item.content
        })),
        {
          role: "user",
          content: answer
        }
      ],
      model: "gpt-4",
    });

    const nextQuestion = completion.choices[0].message.content;

    return NextResponse.json({
      nextQuestion,
      feedback: {
        transcription: answer
      }
    });
  } catch (error) {
    console.error('Error processing answer:', error);
    return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const interviewPrompt = `You are an AI interviewer. Generate relevant interview questions based on the context and previous answers. 
Keep the questions professional and focused on assessing the candidate's skills and experience.`;

export async function POST(request) {
  try {
    const body = await request.json();
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: interviewPrompt },
        { role: "user", content: body.start ? "Start the interview with an initial question" : "Generate the next question based on the previous answer: " + body.previousAnswer }
      ],
      model: "gpt-4",
    });

    return NextResponse.json({
      question: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}

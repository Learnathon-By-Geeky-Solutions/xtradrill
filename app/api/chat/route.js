import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const INTERVIEW_SYSTEM_PROMPT = `You are an AI interviewer conducting a professional job interview. Your role is to:
1. Ask clear, relevant questions about the candidate's experience and skills
2. Listen carefully to their responses and ask appropriate follow-up questions
3. Maintain a professional, encouraging tone
4. Keep responses concise and focused
5. Evaluate answers based on:
   - Relevance to the question
   - Clarity of communication
   - Specific examples provided
   - Problem-solving approach
6. Provide smooth transitions between questions
7. Acknowledge their responses positively before moving to the next question

Remember to:
- Stay focused on the current question
- Keep responses under 3 sentences when possible
- Be encouraging but professional
- Avoid technical jargon unless the candidate uses it first`;

export async function POST(req) {
  try {
    const { message, context, currentQuestion } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const messages = [
      { role: 'system', content: INTERVIEW_SYSTEM_PROMPT },
      { 
        role: 'system', 
        content: `Current interview question being discussed: "${currentQuestion}". 
                 Ensure your response acknowledges their answer and relates to this question.` 
      },
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 150, // Keep responses concise
      presence_penalty: 0.6, // Encourage diverse responses
      frequency_penalty: 0.3, // Reduce repetition
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

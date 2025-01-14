import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const evaluationPrompt = `You are an AI interview evaluator. Analyze the candidate's video interview responses and provide a score out of 100 based on the following criteria:
1. Communication Skills (25 points)
2. Technical Knowledge (25 points)
3. Problem-Solving Ability (25 points)
4. Cultural Fit & Soft Skills (25 points)

Provide a detailed breakdown of the scoring and constructive feedback.`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const video = formData.get('video');

    // Here you would typically:
    // 1. Save the video temporarily
    // 2. Process it through speech-to-text
    // 3. Analyze the text with OpenAI
    // For demo, we'll simulate this with a basic evaluation

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: evaluationPrompt },
        { role: "user", content: "Evaluate this interview response and provide a score" }
      ],
      model: "gpt-4",
    });

    // Parse the score from the AI response
    // In a real implementation, you'd want to structure this better
    const score = Math.floor(Math.random() * 40) + 60; // Simulated score between 60-100

    return NextResponse.json({
      score,
      feedback: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error evaluating interview:', error);
    return NextResponse.json({ error: 'Failed to evaluate interview' }, { status: 500 });
  }
}

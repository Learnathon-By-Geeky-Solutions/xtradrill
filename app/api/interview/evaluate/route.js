import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const evaluationPrompt = `You are an AI interview evaluator for an AI Application Developer position. Analyze the candidate's responses and provide a score out of 100 based on the following criteria:

1. Technical Knowledge (30 points)
   - Understanding of AI/ML concepts
   - Knowledge of programming languages
   - System design and architecture

2. Problem-Solving (30 points)
   - Analytical thinking
   - Solution approach
   - Code optimization

3. Communication (20 points)
   - Clarity of expression
   - Technical communication
   - Response structure

4. Experience & Projects (20 points)
   - Relevant experience
   - Project complexity
   - Impact and results

Please provide:
1. A numerical score for each category
2. The total score (sum of all categories)
3. Specific feedback for improvement
4. Key strengths identified

Format your response as JSON:
{
  "scores": {
    "technical": number,
    "problemSolving": number,
    "communication": number,
    "experience": number
  },
  "totalScore": number,
  "feedback": string,
  "strengths": string[]
}`;

export async function POST(request) {
  try {
    const { answers, history } = await request.json();
    
    // Convert interview history to a structured format for evaluation
    const interviewSummary = history
      .map(item => `${item.role.toUpperCase()}: ${item.content}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: evaluationPrompt },
        { role: "user", content: `Evaluate this interview based on the following conversation:\n\n${interviewSummary}` }
      ],
      model: "gpt-4",
      response_format: { type: "json_object" },
      temperature: 0.7, // Balanced between consistency and flexibility
    });

    // Parse the structured response
    const evaluation = JSON.parse(completion.choices[0].message.content);

    // Generate a deterministic score based on the evaluation
    // Use a hash of the evaluation content to ensure consistency
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify(evaluation))
      .digest('hex');
    
    // Use the hash to generate a score modifier (±5 points)
    const modifier = parseInt(hash.substring(0, 2), 16) % 10 - 5;
    
    // Final score is the AI's evaluation plus a small deterministic modifier
    const finalScore = Math.min(100, Math.max(0, evaluation.totalScore + modifier));

    return NextResponse.json({
      score: finalScore,
      categoryScores: evaluation.scores,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
    });
  } catch (error) {
    console.error('Error evaluating interview:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate interview' }, 
      { status: 500 }
    );
  }
}

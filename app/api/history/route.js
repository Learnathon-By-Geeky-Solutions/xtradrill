import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/lib/models/Conversation';

export async function GET() {
  try {
    await connectDB();
    const conversations = await Conversation.find().sort({ createdAt: -1 });
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { conversation } = await req.json();
    
    const newConversation = new Conversation({
      messages: conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      }))
    });
    
    await newConversation.save();
    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
  }
}

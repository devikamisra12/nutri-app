import { NextResponse } from 'next/server';
import { checkSafety } from '@/lib/safety';
import { callGroqAPI } from '@/lib/groq';
import { getOrCreateConversation, insertMessage, getConversationHistory } from '@/lib/db';
import { AssistantResponse } from '@/lib/types';
import crypto from 'crypto';

// CORS headers for cross-origin requests (Vercel frontend → Railway backend)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400, headers: corsHeaders });
    }

    const convId = await getOrCreateConversation(conversationId);

    // Save user message
    const userMsgId = crypto.randomUUID();
    await insertMessage({
      id: userMsgId,
      conversation_id: convId,
      role: 'user',
      content: message,
      structured_response: null
    });

    // Scope & Safety Check
    const safety = checkSafety(message);
    if (!safety.isSafe) {
      const refusalResponse: AssistantResponse = {
        answer: safety.refusal!,
        claims: []
      };
      
      const assistantMsgId = crypto.randomUUID();
      await insertMessage({
        id: assistantMsgId,
        conversation_id: convId,
        role: 'assistant',
        content: refusalResponse.answer,
        structured_response: JSON.stringify(refusalResponse)
      });
      
      return NextResponse.json({
        conversationId: convId,
        response: refusalResponse
      }, { headers: corsHeaders });
    }

    // Prepare history for LLM
    const history = await getConversationHistory(convId);
    const llmMessages = history.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Call Groq
    const groqResponse = await callGroqAPI(llmMessages);

    // Save Assistant Response
    const assistantMsgId = crypto.randomUUID();
    await insertMessage({
      id: assistantMsgId,
      conversation_id: convId,
      role: 'assistant',
      content: groqResponse.answer,
      structured_response: JSON.stringify(groqResponse)
    });

    return NextResponse.json({
      conversationId: convId,
      response: groqResponse
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

import { NextResponse } from 'next/server';
import { checkSafety } from '@/lib/safety';
import { callGroqAPI } from '@/lib/groq';
import { getOrCreateConversation, insertMessage, getConversationHistory } from '@/lib/db';
import { AssistantResponse } from '@/lib/types';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
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
      });
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
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

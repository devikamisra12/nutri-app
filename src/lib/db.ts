import { Pool } from 'pg';
import { Message } from './types';
import crypto from 'crypto';

let pool: any;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  console.error('DATABASE_URL is not set. Database operations will fail.');
  // Fallback to a dummy pool that throws on query
  pool = {
    query: () => { throw new Error('DATABASE_URL is missing'); }
  } as any;
}

export async function getOrCreateConversation(id?: string): Promise<string> {
  if (id) {
    const res = await pool.query('SELECT id FROM conversation WHERE id = $1', [id]);
    if (res.rows.length > 0) return id;
  }
  
  const newId = crypto.randomUUID();
  await pool.query('INSERT INTO conversation (id) VALUES ($1)', [newId]);
  return newId;
}

export async function insertMessage(msg: Omit<Message, 'created_at'>): Promise<void> {
  await pool.query(`
    INSERT INTO message (id, conversation_id, role, content, structured_response)
    VALUES ($1, $2, $3, $4, $5)
  `, [msg.id, msg.conversation_id, msg.role, msg.content, msg.structured_response]);
}

export async function getConversationHistory(conversationId: string): Promise<Message[]> {
  const res = await pool.query('SELECT * FROM message WHERE conversation_id = $1 ORDER BY created_at ASC', [conversationId]);
  return res.rows as Message[];
}

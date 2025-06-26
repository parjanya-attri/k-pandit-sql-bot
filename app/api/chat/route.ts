import { NextRequest, NextResponse } from 'next/server';
import { Agent, run, user, AgentInputItem } from '@openai/agents';
import { listTablesTool, readTableTool, executeSQLTool } from '@/tools/mssql';
import { instructions, model, agentName } from './constants';

// In-memory session store (replace with Redis/DB for production)
const sessionStore: Record<string, { history: AgentInputItem[], agent: Agent }> = {};

const createAgent = async () => {
  return new Agent({
    name: agentName,
    instructions,
    tools: [listTablesTool, readTableTool, executeSQLTool],
    model,
  });
};

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();

    if (!sessionId || !message || typeof message.content !== 'string' || !message.role) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get or create session
    if (!sessionStore[sessionId]) {
      const agent = await createAgent();
      sessionStore[sessionId] = { history: [], agent };
    }
    const session = sessionStore[sessionId];

    // Add the new user message to history
    session.history.push({ role: message.role, content: message.content });

    // Run the agent with the full history
    const result = await run(session.agent, session.history, { maxTurns: 40 });

    // Only use the last processed response items for history
    const newHistory = result.state._lastProcessedResponse?.newItems || [];

    // Return only the latest conversational items
    return NextResponse.json({
      result: result.finalOutput,
      history: newHistory,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 
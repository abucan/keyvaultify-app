import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log('📥 Received payload from CLI:', body);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

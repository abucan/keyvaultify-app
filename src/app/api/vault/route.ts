import { getSecrets, saveSecrets } from '@/lib/store';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { projectId, environment, encryptedSecrets } = await req.json();

  if (!projectId || !environment || !encryptedSecrets) {
    return new Response('Missing fields', { status: 400 });
  }

  saveSecrets(projectId, environment, encryptedSecrets);
  console.log('📥 Stored secrets for:', projectId, environment);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const environment = searchParams.get('environment');

  if (!projectId || !environment) {
    return new Response('Missing projectId or environment', { status: 400 });
  }

  const entry = getSecrets(projectId, environment);

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(JSON.stringify(entry.encryptedSecrets), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

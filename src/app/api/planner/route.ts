import { createClient } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

function getKV() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return createClient({ url, token });
}

function getWeekKey(mondayDate: string) {
  return `weekly-plan:${mondayDate}`;
}

export async function GET(req: NextRequest) {
  const monday = req.nextUrl.searchParams.get('week');
  if (!monday) {
    return NextResponse.json({ error: 'Missing week param' }, { status: 400 });
  }

  try {
    const kvClient = getKV();
    if (!kvClient) {
      return NextResponse.json({});
    }
    const plan = await kvClient.get(getWeekKey(monday));
    return NextResponse.json(plan ?? {});
  } catch (err) {
    console.error('KV GET error:', err);
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  const monday = req.nextUrl.searchParams.get('week');
  if (!monday) {
    return NextResponse.json({ error: 'Missing week param' }, { status: 400 });
  }

  try {
    const kvClient = getKV();
    if (!kvClient) {
      return NextResponse.json({ error: 'KV not configured' }, { status: 503 });
    }
    const plan = await req.json();
    await kvClient.set(getWeekKey(monday), plan, { ex: 60 * 60 * 24 * 30 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('KV PUT error:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

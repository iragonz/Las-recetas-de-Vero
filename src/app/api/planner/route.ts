import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

function getWeekKey(mondayDate: string) {
  return `weekly-plan:${mondayDate}`;
}

export async function GET(req: NextRequest) {
  const monday = req.nextUrl.searchParams.get('week');
  if (!monday) {
    return NextResponse.json({ error: 'Missing week param' }, { status: 400 });
  }

  const plan = await kv.get(getWeekKey(monday));
  return NextResponse.json(plan ?? {});
}

export async function PUT(req: NextRequest) {
  const monday = req.nextUrl.searchParams.get('week');
  if (!monday) {
    return NextResponse.json({ error: 'Missing week param' }, { status: 400 });
  }

  const plan = await req.json();
  await kv.set(getWeekKey(monday), plan, { ex: 60 * 60 * 24 * 30 }); // expire after 30 days
  return NextResponse.json({ ok: true });
}

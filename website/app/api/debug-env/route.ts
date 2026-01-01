import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasHash: !!process.env.ADMIN_PASSWORD_HASH,
    hashPrefix: process.env.ADMIN_PASSWORD_HASH?.substring(0, 20) || 'N/A',
    hasSecret: !!process.env.SESSION_SECRET,
  });
}

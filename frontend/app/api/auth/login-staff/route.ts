import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  console.log("body", body);
  console.log("env", process.env.NEXT_PUBLIC_API_URL);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login-staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

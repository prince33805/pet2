import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  const token = req.headers.get('authorization'); // รับจาก client
  const res = await fetch(`${API_URL}/customer`, {
    headers: {
      Authorization: token ?? '', // custom header
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
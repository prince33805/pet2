import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  const token = req.headers.get('authorization'); // รับจาก client
  const res = await fetch(`${API_URL}/appointment`, {
    headers: {
      Authorization: token ?? '', // custom header
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization'); // รับจาก client
  const body = await req.json();
  console.log("body",body)
  const res = await fetch(`${API_URL}/appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ?? '', // custom header
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
    console.error("Backend Error:", errorData);

    return NextResponse.json(
      { error: true, message: errorData.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" },
      { status: res.status }
    );
  }
  console.log("res",res)  
  const data = await res.json();
  return NextResponse.json(data);
}

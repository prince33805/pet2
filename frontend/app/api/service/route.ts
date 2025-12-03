import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const limit = searchParams.get('limit');
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'asc';
  const token = req.headers.get('authorization');
  const backendUrl = `${API_URL}/service?page=${page}&limit=${limit}&search=${search}&sort=${sort}`;
  console.log("backendUrl",backendUrl)
  const res = await fetch(backendUrl, {
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
  console.log("body", body);
  body.price = Number(body.price);

  const res = await fetch(`${API_URL}/service`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'x-api-key': 'frontend-key-123',
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
  const data = await res.json();
  console.log("data", data);
  return NextResponse.json(data);
}

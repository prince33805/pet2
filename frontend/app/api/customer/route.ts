import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const limit = searchParams.get('limit') ?? '10';
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'asc';
  const token = req.headers.get('authorization');
  const backendUrl = `${API_URL}/customer?page=${page}&limit=${limit}&search=${search}&sort=${sort}`;
  const res = await fetch(backendUrl, {
    headers: {
      Authorization: token ?? '', // custom header
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = req.headers.get('authorization');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/${id}/pets`, {
      headers: {
        Authorization: token || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error fetching customer pets:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

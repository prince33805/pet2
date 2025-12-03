import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
    console.log("object")
    const token = req.headers.get('authorization'); // รับจาก client
    const { date } = req.url.split('?')[1]?.split('&').reduce((acc, curr) => {
        const [key, value] = curr.split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>) || ({} as Record<string, string>);
    console.log("date", date)
    const res = await fetch(`${API_URL}/slots/availability?date=${date}`, {
        headers: {
            Authorization: token ?? '', // custom header
        },
    });
    const data = await res.json();
    return NextResponse.json(data);
}


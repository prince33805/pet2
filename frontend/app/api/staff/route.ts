import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
    const token = req.headers.get('authorization'); // รับจาก client
    const res = await fetch(`${API_URL}/staff`, {
        headers: {
            Authorization: token ?? '', // custom header
        },
    });
    //   const data = await res.json();
    const data = {
        data: [
            {
                "id": "1",
                "name": "Alice Johnson",
                "phone": "555-1234",
                "role": "Stylist",
                "hiredDate": "2022-01-15T00:00:00Z"
            },
            {
                "id": "2",
                "name": "Bob Smith",
                "phone": "555-5678",
                "role": "Groomer",
                "hiredDate": "2021-11-20T00:00:00Z"
            }
        ]
    }
    return NextResponse.json(data);
}
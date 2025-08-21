/* eslint-disable @typescript-eslint/no-explicit-any */
import { secureFetch } from '@/app/lib/server-fetch';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	const data = await req.json();
	if (!data.endpoint)
		return NextResponse.json({ error: 'URL yok' }, { status: 400 });

	console.log('data', data);

	try {
		const response = await secureFetch(data.endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		return NextResponse.json(response);
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

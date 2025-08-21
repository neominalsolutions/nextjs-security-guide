import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Not: 12 salt default tercih edilen CPU süresi 100 ms
// 14 brute force saldırılarına daha dirençli ama CPU süresi yaklaşık 300 ms, Sunucu yükü artıyor

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { password } = body;

	console.log('password', password);

	if (!password || password.length < 6) {
		return NextResponse.json(
			{ error: 'Parola en az 6 karakter olmalı' },
			{ status: 400 }
		);
	}

	const saltRounds = 12;
	const salt = await bcrypt.genSalt(saltRounds);
	const hash = await bcrypt.hash(password, salt);

	console.log('hash', hash);

	return NextResponse.json({ salt, hash });
}

'use server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function generateCsrfToken() {
	const token = crypto.randomBytes(32).toString('hex');
	const cookieStore = await cookies();
	cookieStore.set({
		name: 'csrfToken',
		value: token,
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		path: '/',
	});
	return token;
}

'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation'; // Redirect'i import et
const SECRET = process.env.JWT_SECRET;

console.log('SECRET', SECRET);

export async function login(formData: FormData) {
	const email = formData.get('email')?.toString();
	const password = formData.get('password')?.toString();

	debugger;
	// Basit kontrol (örnek)
	if (email === 'test@test.com' && password === '1234') {
		// SECRET kontrolü
		if (!SECRET) {
			throw new Error('JWT_SECRET environment variable is not set');
		}

		// JWT oluştur
		const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });

		const _secure = process.env.NODE_ENV === 'production';

		(
			await // Cookie olarak set et
			cookies()
		).set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // localde false olur,
			sameSite: 'strict',
			path: '/',
			maxAge: 60 * 60, // 1 saatlik
		});

		redirect('/profile');

		return { success: true };
	}

	return { success: false, message: 'Geçersiz kullanıcı' };
}

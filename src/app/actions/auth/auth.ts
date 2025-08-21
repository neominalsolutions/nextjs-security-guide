'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation'; // Redirect'i import et
const SECRET = process.env.JWT_SECRET;
import { jwtVerify, SignJWT } from 'jose';

console.log('SECRET', SECRET);

export async function login(formData: FormData) {
	const email = formData.get('email')?.toString();
	const password = formData.get('password')?.toString();

	const SECRET_KEY = new TextEncoder().encode(SECRET);

	debugger;
	// Basit kontrol (örnek)
	if (email === 'test@test.com' && password === '1234') {
		// SECRET kontrolü
		if (!SECRET) {
			throw new Error('JWT_SECRET environment variable is not set');
		}

		// var privateKey = fs.readFileSync('private.key');
		// var token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' });
		// JWT oluştur
		// Minimum HS256 bit seçilmeli, tercihen 512 yapamk daha güvenli olur. R
		// RSA de tercih edilebilir fakar JWT oluşturma kısımlarında birazda hantal.
		// const token = jwt.sign({ email }, SECRET, {
		// 	expiresIn: '1h',
		// 	algorithm: 'HS512',
		// });

		const token = await new SignJWT({ email })
			.setProtectedHeader({ alg: 'HS256' }) // Algoritma tipi
			.setIssuedAt() // Token oluşturulma zamanı
			.setExpirationTime('1h') // Token geçerlilik süresi (1 saat)
			.sign(SECRET_KEY); // İmza işlemi

		(
			await // Cookie olarak set et
			cookies()
		).set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // localde false olur,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60, // 1 saatlik
		});

		redirect('/profile');

		return { success: true };
	}

	return { success: false, message: 'Geçersiz kullanıcı' };
}

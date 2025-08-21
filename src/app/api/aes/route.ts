/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Avantajları
// Yüksek güvenlik (hem şifreleme hem doğrulama)
// Modern web ve API şifrelemesinde standart olarak tercih edilir
// AES simetrik şifreleme + Galois doğrulama → modern, hızlı ve güvenli bir şifreleme standardıdır.

export async function POST(req: NextRequest) {
	try {
		const { text } = await req.json();
		if (!text) {
			return NextResponse.json({ error: 'Metin boş olamaz' }, { status: 400 });
		}

		// AES-256-GCM için 32 byte key
		const key = crypto.randomBytes(32);
		// IV (nonce) için 12 byte
		// iv (nonce) → şifrelemenin rastgele olması için gerekli
		// Aynı key ile farklı IV kullanmak güvenliği artırır. İkisinden biri farklı olmalı.
		const iv = crypto.randomBytes(12);

		// Cipher oluştur
		// 256-bit key, Galois/Counter Mode (GCM) ile şifreleme
		// Galois/Counter Mode (GCM) mod AES’in klasik blok şifrelemesinin üzerine modifikasyon ve doğrulama ekler. Hem gizlilik (confidentiality) hem de bütünlük (integrity/authentication) sağlar
		const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

		let encrypted = cipher.update(text, 'utf8', 'base64');
		encrypted += cipher.final('base64');

		// authTag → şifrelenmiş mesajın bütünlüğünü doğrular
		// GCM, şifrelenmiş verinin değişmediğini doğrulamak için 16 byte’lık bir tag üretir.
		// Çözme sırasında bu tag doğrulanmazsa decryption başarısız olur.
		const authTag = cipher.getAuthTag().toString('base64');

		//  Decrypt testi
		const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
		decipher.setAuthTag(Buffer.from(authTag, 'base64'));
		const decrypted =
			decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8');

		return NextResponse.json({
			encrypted,
			key: key.toString('base64'),
			iv: iv.toString('base64'),
			authTag,
			decrypted,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { privateKey, publicKey } from './keys';


// RSA-OAEP’in Özellikleri

//Randomization: Her şifrelemede farklı ciphertext üretir, aynı plaintext tekrar şifrelenirse farklı olur.

//Chosen ciphertext attack (CCA) koruması: Saldırganın ciphertext üzerinden plaintext’i tahmin etmesi çok zorlaşır.

// Hash tabanlı mask generation function (MGF1): Padding algoritması içinde SHA-256 ile şifreleme güvenliği artırma. Amaç: plaintext’i şifrelemeden önce rastgele bir “mask” ile karıştırmak ve deterministik olmaktan kurtarmak.

export async function POST(req: NextRequest) {
	try {
		const { text } = await req.json();
		if (!text) {
			return NextResponse.json({ error: 'Metin boş olamaz' }, { status: 400 });
		}

		// Metni şifrele (RSA-OAEP + public key)
		const buffer = Buffer.from(text, 'utf8');
		const encryptedBuffer = crypto.publicEncrypt(
			{
				key: publicKey,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: 'sha256', // oaepHash: "sha256" → SHA-256 hash ile güvenliği artırıyoruz
			},
			buffer
		);

		const encryptedBase64 = encryptedBuffer.toString('base64');

		// İsteğe bağlı olarak hemen çöz ve test edebiliriz
		const decryptedBuffer = crypto.privateDecrypt(
			{
				key: privateKey,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: 'sha256', // oaepHash: "sha256" → SHA-256 hash ile güvenliği artırıyoruz
			},
			encryptedBuffer
		);

		return NextResponse.json({
			encrypted: encryptedBase64,
			decrypted: decryptedBuffer.toString('utf8'),
		});
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

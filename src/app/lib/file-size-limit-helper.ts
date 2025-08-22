/* eslint-disable @typescript-eslint/no-explicit-any */
// Güvenli fetch fonksiyonu

// Dosya upload işlemlerinde DDOS saldırılarına karşı kullanalım
export async function fileSizeCheck(requestBody: any, filesizeLimit: number) {
	// Response boyut limiti (default: 2MB)
	const limit = filesizeLimit;
	const reader = requestBody!.getReader();
	let received = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		received += value.byteLength;

		// Response limiti aşıldı mı kontrol et
		if (received > limit) {
			throw new Error('Response too large');
		}
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Güvenli fetch fonksiyonu

// Dosya upload işlemlerinde DDOS saldırılarına karşı kullanalım
// Mıme type kontrolü
// zip uzantı dosya mı değil mi
// file size limit
// hatta istek yavaşlatma throtting de uygulanabilir. isteklere delay ile NextResponse bekletilmesi.
// rate limitting
// Arada zaten bir WAF yapısı olmalıdır

// Sistem DDOS saldırılarına karşı nasıl bir davranış sergiler ? için load test jmetter load test toolları. Simulation Test, İlgili endpointlerin dayanıklılık testi vs süreçler için
// @upstash/ratelimit
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

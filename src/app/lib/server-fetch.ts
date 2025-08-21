import { lookup } from 'dns/promises'; // DNS çözümleme (hostname → IP)
import ipaddr from 'ipaddr.js'; // IP adreslerini parse ve match etmek için kütüphane

// SSRF (Server-Side Request Forgery) gibi saldırılara karşı güvenlik
// Özel IP aralıklarına yapılan istekleri engellemek (ör. 127.0.0.1, 169.254.x.x, fc00::)
// DNS rebinding saldırılarını önlemek (DNS çözümlemesini kontrol ediyor)
// Redirect engelleme veya sınırlandırma
// Response boyut limiti koymak (ör. max 2MB) DoS önleme
// Timeout mekanizması ile uzun süre beklemeyi engellemek

// IPv4 için özel (private) ağ aralıkları
const PRIVATE_RANGES = [
	{ range: '10.0.0.0', mask: 8 }, // 10.0.0.0 – 10.255.255.255
	{ range: '172.16.0.0', mask: 12 }, // 172.16.0.0 – 172.31.255.255
	{ range: '192.168.0.0', mask: 16 }, // 192.168.0.0 – 192.168.255.255
	{ range: '127.0.0.0', mask: 8 }, // localhost (loopback)
	{ range: '169.254.0.0', mask: 16 }, // link-local (genelde cloud metadata servisleri)
];

// IPv6 için özel ağ aralıkları
const PRIVATE_V6 = [
	{ range: 'fc00::', mask: 7 }, // unique local address (ULA)
	{ range: 'fe80::', mask: 10 }, // link-local IPv6
	{ range: '::1', mask: 128 }, // loopback (::1)
];

// IP adresi özel aralıkta mı kontrolü
function isPrivateIP(ip: string) {
	const addr = ipaddr.parse(ip);

	if (addr.kind() === 'ipv4') {
		return PRIVATE_RANGES.some(({ range, mask }) =>
			ipaddr.parse(range).match(addr, mask)
		);
	}
	if (addr.kind() === 'ipv6') {
		return PRIVATE_V6.some(({ range, mask }) =>
			ipaddr.parse(range).match(addr, mask)
		);
	}
	return true; // tanımlanamayanları da engelle
}

// Güvenli fetch fonksiyonu
export async function secureFetch(
	inputUrl: string,
	opts?: RequestInit & { sizeLimitBytes?: number }
) {
	const url = new URL(inputUrl);

	// http dışındaki protokolleri engellenmesi
	if (!['http:', 'https:'].includes(url.protocol)) {
		throw new Error('Only http/https allowed');
	}

	// domain whitelist (isteğe bağlı güvenlik kuralı)
	const ALLOWLIST =
		process.env.NODE_ENV === 'development'
			? ['localhost', '127.0.0.1', '::1', 'api.example.com', 'cdn.example.com']
			: ['api.example.com', 'cdn.example.com'];

	if (!ALLOWLIST.includes(url.hostname)) {
		throw new Error('Hostname not allowed');
	}

	// DNS çözümleme ve çıkan IP adreslerini kontrol etme
	const addrs = await lookup(url.hostname, { all: true });
	for (const a of addrs) {
		if (isPrivateIP(a.address) && process.env.NODE_ENV !== 'development') {
			throw new Error('Private/loopback IP blocked');
		}
	}

	// Timeout mekanizması
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 80000);

	try {
		// Fetch isteği
		const res = await fetch(url.toString(), {
			...opts,
			redirect: 'error', // Redirect engelleniyor (isteğe göre "manual" da olabilir)
			signal: controller.signal,
		});

		if (!res.ok) throw new Error(`Upstream error ${res.status}`);

		// Response boyut limiti (default: 2MB)
		const limit = opts?.sizeLimitBytes ?? 2 * 1024 * 1024;
		const reader = res.body!.getReader();
		let received = 0;
		const chunks: Uint8Array[] = [];

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			received += value.byteLength;

			// Response limiti aşıldı mı kontrol et
			if (received > limit) {
				controller.abort();
				throw new Error('Response too large');
			}
			chunks.push(value);
		}

		console.log('res', res);

		// Uint8Array → string dönüştür
		const data = Buffer.concat(chunks.map((c) => Buffer.from(c)));
		return JSON.parse(new TextDecoder().decode(data));
	} finally {
		clearTimeout(timeout); // her durumda timer temizle
	}
}

// client fetch isteklerinde zaman açımı mekanizmasını merkezi olarak uygulama

// sunucumuz DDOS saldırıların karşı koruyan bir yöntem
// büyük boyutta bir dosya yüklemesi yapaılabilir. (zip slip) bunlara karşı korunaklı olsun diye en azından istek belirtilen zamanı aşarsa istekği cancel et ve sunucu isteği işlemesin.
export async function proxyFetch(
	url: string,
	opts?: RequestInit & { timeoutMs?: number }
) {
	const controller = new AbortController(); // request cancelation
	const timeout = setTimeout(
		() => controller.abort(),
		opts?.timeoutMs ?? 30_000
	); // default 30s

	try {
		const res = await fetch(url, {
			...opts,
			signal: controller.signal,
			redirect: 'error',
		});

		if (!res.ok) throw new Error(`Upstream error ${res.status}`);

		return res;
	} finally {
		clearTimeout(timeout);
	}
}

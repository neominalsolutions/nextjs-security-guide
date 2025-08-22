// client fetch isteklerinde zaman açımı mekanizmasını merkezi olarak uygulama

export async function proxyFetch(
	url: string,
	opts?: RequestInit & { timeoutMs?: number }
) {
	const controller = new AbortController();
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

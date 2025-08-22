/* eslint-disable @typescript-eslint/no-explicit-any */
import { lookup } from 'dns/promises';
import ipaddr from 'ipaddr.js';

// Sunucuya yapılan GET,POST,PUT,DELETE ve FORMActions işlemleri için kullanalım.
// private IP’ler, loopback ve link-local engelleniyor.
// DNS çözümlemesi yapılıyor → domain’ler private IP’ye resolve olursa engelleniyor.
// JSON body veya form data içindeki URL’leri de tarıyor.

// IPv4 özel aralıklar
const PRIVATE_RANGES = [
	{ range: '10.0.0.0', mask: 8 },
	{ range: '172.16.0.0', mask: 12 },
	{ range: '192.168.0.0', mask: 16 },
	{ range: '127.0.0.0', mask: 8 },
	{ range: '169.254.0.0', mask: 16 },
];

// IPv6 özel aralıklar
const PRIVATE_V6 = [
	{ range: 'fc00::', mask: 7 },
	{ range: 'fe80::', mask: 10 },
	{ range: '::1', mask: 128 },
];

// IP kontrolü
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
	return true;
}

// URL validasyonu
async function validateUrl(urlStr: string) {
	try {
		const url = new URL(urlStr);

		if (!['http:', 'https:'].includes(url.protocol)) {
			throw new Error('Only http/https allowed');
		}

		const addrs = await lookup(url.hostname, { all: true });
		for (const a of addrs) {
			if (isPrivateIP(a.address) && process.env.NODE_ENV !== 'development') {
				throw new Error('Private/loopback IP blocked');
			}
		}
	} catch (err) {
		throw new Error(`Invalid or blocked URL: ${urlStr}`);
	}
}

// Recursive olarak objede URL aramak
export async function validateSsrfRequest(obj: any) {
	if (!obj) return;

	if (typeof obj === 'string') {
		if (obj.startsWith('http://') || obj.startsWith('https://')) {
			await validateUrl(obj);
		}
	} else if (typeof obj === 'object') {
		for (const key of Object.keys(obj)) {
			await validateSsrfRequest(obj[key]);
		}
	}
}

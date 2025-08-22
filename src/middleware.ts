import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // jose kütüphanesini kullanıyoruz
import { validateUrl } from './app/lib/ssrf-request-validator';

const SECRET = process.env.JWT_SECRET;

// Hangi sayfaları korumak istediğimizi belirleyelim
const protectedRoutes = ['/dashboard', '/profile'];

// Not: Token bilgileri Client tarafta store edilmemeli
// localStorage,Session Storage gibi bölgeler güvensiz
// Oturum bilgileri serverside yöntilmeli, nextjs böyle bir şansımız var. middleware ile yönetim yapabiliriz.

// Nextjs middlewareler Edge tabanlı çalıştırıkların hızlı, performaslı işlemeleri açısında bu midldwarelerde body ve formdata gibi süreçlerin kontrolünü manuplasyonunu sağlıyamıyoruz.
// request header, cookies, req.url gibi bazı kontroller yapabiliriz.
export async function middleware(req: NextRequest) {
	console.log('middleware');

	const { pathname } = req.nextUrl;

	// istek yapılan Urllerin SSRF açısında kontrolü
	if (process.env.NODE_ENV === 'production') {
		await validateUrl(req.url);
	}

	// Eğer protected route değilse -> devam et
	if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
		return NextResponse.next();
	}

	// Cookie'den token al
	const token = req.cookies.get('token')?.value;

	console.log('token', token);

	if (!token) {
		return NextResponse.redirect(new URL('/login', req.url));
	}

	try {
		if (!SECRET) {
			throw new Error('JWT secret is not defined');
		}
		const encoder = new TextEncoder();
		const secretKey = encoder.encode(SECRET);
		const { payload } = await jwtVerify(token, secretKey);
		const user: string = payload?.email as string;
		const response = NextResponse.next();
		response.headers.set('X-User-Email', user); // Email bilgisini header'a set et

		// JWT token’ı Authorization header ile protected routelarda token bazlı erişim
		response.headers.set('Authorization', `Bearer ${token}`);

		// End-to-End Headers -> Request/Response boyunca tüm proxy’ler, gateway’ler, sunucular tarafından iletilmek zorunda olan header’lardır. Content-Type, Authorization, User-Agent

		// Hop-by-Hop Headers ->  Sadece bir bağlantı (hop) için geçerli olan header’lardır. Proxy veya load balancer gibi aracı katmanlar bunları bir sonraki hop’a iletmez.

		// Senaryo 1:
		// Not: Client → Nginx (reverse proxy) → Next.js app
		// Bu durumda hop-by-hop header’ları temizleme işi Nginx’in görevi.
		// hop-by-hop header’lar bir sonraki hop’a aktarılmamalı.

		// Senaryo 2:
		// Client → Nginx → Next.js (proxy gibi davranıyor) → .NET Core API (downstream)
		// Burada Next.js artık bir forwarding proxy rolüne giriyor.
		// Bu durumda Next.js, hop-by-hop header’ları forward etmeden önce temizlemeli. Yoksa .NET Core gibi backend’lerde HTTP Request Smuggling açığı oluşabilir.

		// Hop-by-hop header'ları temizle
		const hopByHopHeaders = [
			'connection',
			'keep-alive',
			'proxy-authenticate',
			'proxy-authorization',
			'te',
			'trailer',
			'transfer-encoding',
			'upgrade',
		];

		hopByHopHeaders.forEach((h) => response.headers.delete(h));

		return response;
	} catch (err) {
		console.log('err', err);
		return NextResponse.redirect(new URL('/login', req.url));
	}
}

// Middleware scope
export const config = {
	matcher: ['/dashboard/:path*', '/profile/:path*'],
};

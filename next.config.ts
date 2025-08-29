import type { NextConfig } from 'next';
const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
	// XSS saldırılarını engellemek için
	{
		key: 'X-XSS-Protection',
		value: '1; mode=block',
	},
	// MIME tipi saldırılarını önlemek için
	// Tarayıcıların gelen dosyanın gerçek MIME tipini (Content-Type) kontrol etmesini sağlar.
	// Sunucudan gelen bir dosya Content-Type: text/css olarak işaretlenmiş ama aslında içinde JavaScript kodu varsa, tarayıcı bunu çalıştırmaz.
	// nosniff MIME Sniffing saldırılarını önler
	{
		key: 'X-Content-Type-Options',
		value: 'nosniff',
	},
	// Clickjacking önleme
	{
		key: 'X-Frame-Options',
		value: 'DENY',
	},
	// Referrer bilgisini kontrol etmek
	// Bu başlık, tarayıcının HTTP referrer bilgisini (yani kullanıcı bir sayfadan başka bir sayfaya geçerken gönderilen kaynak bilgisi) nasıl göndereceğini kontrol eder.
	/*
    Aynı origin (domain) içi geçişlerde: Tam URL (yani sayfa yolu dahil) gönderilir.
    Örnek: https://example.com/page1 → https://example.com/page2 → Referer: https://example.com/page1
    Farklı origin’e geçişlerde: Sadece origin bilgisi gönderilir, path bilgisi gizlenir.
    Örnek: https://example.com/page1 → https://other.com/page2 → Referer: https://example.com/
    HTTPS → HTTP geçişlerinde: Referrer hiç gönderilmez, böylece hassas bilgiler korunur.

  */
	{
		key: 'Referrer-Policy',
		value: 'strict-origin-when-cross-origin',
	},
	// Tarayıcıların siteyi güvenli olarak kabul etmesini sağlamak
	{
		key: 'Strict-Transport-Security', // HSTS
		value: 'max-age=31536000; includeSubDomains; preload', // 1 yıl boyunca tarayıcaya gelen HTTP isteklerini HTTPS yönlendir, Ana domain’in alt domainlerini de bu kuralı uygula
		// preload ile kullanıcılar tarayıcıda hemen HTTPS kullanmaya başlar, MITM (man-in-the-middle) riskini azaltır.
	},
	// Content Security Policy
	{
		key: 'Content-Security-Policy', // Dev Modda Nextjs Inline script style kullanırız. Bu engele takılamamk için
		value: isDev
			? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
			: "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self'; frame-src 'none';connect-src 'self'; img-src 'self' data: https:;",
	},
	// Cross-site scripting ve tıklama saldırılarını önlemek
	{
		key: 'Permissions-Policy',
		value: 'geolocation=(), microphone=(), camera=()',
	},
	{
		key: 'Access-Control-Allow-Origin',
		value: 'https://your-trusted-domain.com', // sadece güvenli domainler
	},
	{
		key: 'Access-Control-Allow-Methods',
		value: 'GET,POST,OPTIONS',
	},
	{
		key: 'Access-Control-Allow-Headers', // Access-Control-Allow-Headers: Content-Type, Authorization → cross origin isteklerinde (GET,POST,PUT,DELETE) tarayıcıya izin verilen header’ları bildirir.  Same-origin istekler (aynı domain) için bu kısıtlama yoktur.
		// Fazla header'a izin vermek → potansiyel XSS/CSRF riskini artırır
		value: 'Content-Type,Authorization',
	},
	{
		key: 'Access-Control-Allow-Credentials', // Default olarak Tarayıcı, cross-origin request’lerde cookie göndermez. Eğer bu özellik açılırsa, Tarayıcı cross-origin request yaparken cookie’leri, HTTP authentication header’larını veya client sertifikalarını gönderebilir. Access-Control-Allow-Origin: * ile birlikte kullanılamaz.
		// Bu özelliği kullanabilmek için axios da withCredentials: true olarak gönderim sağlanmalıdır. Bunu kullanırken JWT veya session cookie’lerini HttpOnly ve Secure yap
		value: 'true',
	},
];

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false, // <-- X-Powered-By kaldırır
	async headers() {
		return [
			{
				// Tüm sayfalara uygulamak için
				source: '/(.*)',
				headers: securityHeaders,
			}
		];
	},
};

export default nextConfig;

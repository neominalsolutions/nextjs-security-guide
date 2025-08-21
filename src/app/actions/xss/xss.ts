import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { z } from 'zod';

// DOMPurify normalde tarayıcı ortamında çalışır
// Bu sebeple Nodejs oratmında sanitize işlemi için sanal bir DOM ortamı gerekiyor.
// Bunu JSDOM ile yapılandırıyoruz
// server-side DOMPurify setup
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Not: Backtracking-heavy pattern = nested veya alternatif tekrarlar ile CPU’yu zorlayan pattern. lineer zamanlı değil, input değeri uzadıkça çalışma süresi katlanarak artar ReDOS saldırılarına dayanıjsız.
//  Riskli Regexler /(a+)+$/, /(\d+)+$/

// /^(?:[a-zA-Z0-9 ](?!\1{2}))*$/ -> Güvenli
// [a-zA-Z0-9 ] → sadece harf, rakam ve boşluk.
// (?!\1{2}) → ardışık üç aynı karakteri engeller.

// Lineer zamanlı (linear time), algoritmanın veya işlemin çalışma süresinin input büyüklüğü ile doğru orantılı ReDoS riski yok

// Input validation schema
const inputSchema = z.object({
	message: z
		.string()
		.regex(/^([a-zA-Z0-9 ])(?!\1{2})*$/, 'Sadece harf ve rakam')
		.min(3, 'Minimum 3 kareter')
		.max(10, 'Mesaj çok uzun'),
});

// Server Action
export async function XssSubmitForm(formData: FormData) {
	'use server';

	const message = formData.get('message')?.toString() || '';

	// Validate input
	const parsed = inputSchema.parse({ message });

	// Sanitize HTML
	const cleanMessage = purify.sanitize(parsed.message);

	console.log('cleanMessage', cleanMessage);

	return { message: cleanMessage };
}

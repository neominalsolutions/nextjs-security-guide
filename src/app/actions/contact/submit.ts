'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { validateSsrfRequest } from '@/app/lib/ssrf-request-validator';

export async function contactSubmitForm(formData: FormData) {
	const cookieStore = await cookies();
	const tokenCookie = cookieStore.get('csrfToken')?.value;
	const tokenForm = formData.get('csrfToken');

	if (process.env.NODE_ENV === 'production') {
		// FormData için kullanım örneği
		await validateSsrfRequest(formData);
	}

	console.log('tokenCookie', tokenCookie);
	console.log('tokenForm', tokenForm);

	if (!tokenCookie || tokenForm !== tokenCookie) {
		throw new Error('CSRF token mismatch');
	}

	// İşlem başarılıysa token'ı silin:
	cookieStore.delete('csrfToken');

	revalidatePath('/');
}

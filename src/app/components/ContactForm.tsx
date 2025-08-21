'use client';

import { useEffect, useState } from 'react';
import { contactSubmitForm } from '../actions/contact/submit';
import { generateCsrfToken } from '../actions/csrf/csrf';

export default function ContactForm() {
	const [csrfToken, setCsrfToken] = useState<string>('');

	useEffect(() => {
		loadToken();
	}, []);

	async function loadToken() {
		const token = await generateCsrfToken();
		setCsrfToken(token);
	}

	return (
		<form action={contactSubmitForm}>
			{csrfToken && (
				<>
					<input type="hidden" name="csrfToken" value={csrfToken} />
					<input type="text" name="message" placeholder="Mesajınız" />
					<button type="submit">Gönder</button>
				</>
			)}
		</form>
	);
}

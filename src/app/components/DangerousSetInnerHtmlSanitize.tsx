'use client';

import DOMPurify from 'dompurify';
// Not: dompurify browser (DOM) API’lerini kullanır

export default function DangerousSetInnerHtmlSanizate() {
	const clean = DOMPurify.sanitize(
		`http://localhost:3000/?content=<img src=x onerror=alert('XSS')>`
	);

	return (
		<>
			<hr></hr>
			<h3>Güvenli Kullanım</h3>
			<div
				dangerouslySetInnerHTML={{
					__html: clean,
				}}
			/>
		</>
	);
}

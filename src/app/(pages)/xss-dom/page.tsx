import DangerousSetInnerHtmlSanizate from '@/app/components/DangerousSetInnerHtmlSanitize';

// app/page.tsx
export default function Page() {
	const uri = `http://localhost:3000/?content=<img src=x onerror=alert('XSS')>`;

	return (
		<div>
			{/* <h3>Güvenlik Açığı oluşturan Kullanım</h3> */}

			{/* <div
				dangerouslySetInnerHTML={{
					__html: `http://localhost:3000/?content=<img src=x onerror=alert('XSS')>`,
				}}
			/> */}
			{/* <div>{uri}</div> */}
			<hr />
			<DangerousSetInnerHtmlSanizate />
		</div>
	);
}

// Not: Eğer mecbursan mutlaka sanitize et (DOMPurify veya benzeri).
// Bu tarz veriler için Markdown kullanabilirsiniz.
// http://localhost:3000/?content=<img src=x onerror=alert('XSS')>

'use client';

import { useState } from 'react';

export default function RSAEncryptorClient() {
	const [text, setText] = useState('');
	const [encrypted, setEncrypted] = useState('');
	const [decrypted, setDecrypted] = useState('');
	const [loading, setLoading] = useState(false);

	const handleEncryptAndSend = async () => {
		if (!text) return;
		setLoading(true);
		setEncrypted('');
		setDecrypted('');

		try {
			const res = await fetch('/api/rsa', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text }),
			});

			const data = await res.json();
			setEncrypted(data.encrypted || '');
			setDecrypted(data.decrypted || data.error);
		} catch {
			setDecrypted('Sunucuya erişilemedi');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
			<textarea
				placeholder="Şifrelenecek metni girin"
				value={text}
				onChange={(e) => setText(e.target.value)}
				style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
			/>
			<button
				onClick={handleEncryptAndSend}
				style={{ width: '100%', padding: '8px' }}
			>
				{loading ? 'İşleniyor...' : 'Şifrele & Gönder'}
			</button>

			{encrypted && (
				<div
					style={{
						marginTop: '20px',
						wordBreak: 'break-all',
						maxHeight: '150px', // kutu yüksekliği
						overflowY: 'auto', // dikey kaydırma
						padding: '10px',
						border: '1px solid #ccc',
						borderRadius: '4px',
						backgroundColor: '#f9f9f9',
					}}
				>
					<p>
						<strong>Şifreli (Base64):</strong>
					</p>
					<pre>{encrypted}</pre>
				</div>
			)}

			{decrypted && (
				<div style={{ marginTop: '20px' }}>
					<p>
						<strong>Sunucudan Çözülen:</strong>
					</p>
					<pre>{decrypted}</pre>
				</div>
			)}
		</div>
	);
}

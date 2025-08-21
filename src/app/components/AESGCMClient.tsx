'use client';

import { useState } from 'react';

export default function AESGCMClient() {
	const [text, setText] = useState('');
	const [encrypted, setEncrypted] = useState('');
	const [key, setKey] = useState('');
	const [iv, setIv] = useState('');
	const [authTag, setAuthTag] = useState('');
	const [decrypted, setDecrypted] = useState('');
	const [loading, setLoading] = useState(false);

	const handleEncrypt = async () => {
		if (!text) return;
		setLoading(true);
		try {
			const res = await fetch('/api/aes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text }),
			});

			const data = await res.json();
			setEncrypted(data.encrypted);
			setKey(data.key);
			setIv(data.iv);
			setAuthTag(data.authTag);
			setDecrypted(data.decrypted);
		} catch (err) {
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
			<button onClick={handleEncrypt} style={{ width: '100%', padding: '8px' }}>
				{loading ? 'İşleniyor...' : 'Şifrele & Gönder'}
			</button>

			{encrypted && (
				<div style={{ marginTop: '20px', wordBreak: 'break-all' }}>
					<p>
						<strong>Şifreli (Base64):</strong>
					</p>
					<pre>{encrypted}</pre>
					<p>
						<strong>Key:</strong> {key}
					</p>
					<p>
						<strong>IV:</strong> {iv}
					</p>
					<p>
						<strong>Auth Tag:</strong> {authTag}
					</p>
					<p>
						<strong>Sunucuda Çözülen:</strong> {decrypted}
					</p>
				</div>
			)}
		</div>
	);
}

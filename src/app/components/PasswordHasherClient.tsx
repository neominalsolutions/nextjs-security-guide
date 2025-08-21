'use client';

import { useState } from 'react';

export default function PasswordHasherClient() {
	const [password, setPassword] = useState('');
	const [result, setResult] = useState<{
		salt?: string;
		hash?: string;
		error?: string;
	} | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) return;

		setLoading(true);
		setResult(null);

		try {
			const endpoint = 'http://localhost:3000/api/hashPassword';
			const res = await fetch('/api/proxy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password, endpoint }),
			});

			const data = await res.json();
			setResult(data);
		} catch (err) {
			setResult({ error: 'Sunucuya erişilemedi' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
			<form onSubmit={handleSubmit}>
				<input
					type="password"
					placeholder="Parolanızı girin"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
				/>
				<button
					type="submit"
					disabled={loading}
					style={{ width: '100%', padding: '8px' }}
				>
					{loading ? 'Hash Üretiliyor...' : 'Hash Üret'}
				</button>
			</form>

			{result && (
				<div style={{ marginTop: '20px', wordBreak: 'break-all' }}>
					{result.error ? (
						<p style={{ color: 'red' }}>{result.error}</p>
					) : (
						<>
							<p>
								<strong>Salt:</strong> {result.salt}
							</p>
							<p>
								<strong>Hash:</strong> {result.hash}
							</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}

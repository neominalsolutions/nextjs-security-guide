import { headers } from 'next/headers';
import Link from 'next/link';

export default async function Page() {
	const userEmail = (await headers()).get('X-User-Email'); // Header'dan email bilgisini al

	return (
		<div style={{ padding: 10 }}>
			<h1>Profile Page</h1>

			<p>Welcome {userEmail}</p>

			<br></br>
			<Link href="/">Anasayfa</Link>
		</div>
	);
}

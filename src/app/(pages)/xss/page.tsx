import { XssSubmitForm } from '@/app/actions/xss/xss';
import Link from 'next/link';

function Page() {
	return (
		<div style={{ padding: 10 }}>
			<form action={XssSubmitForm}>
				<textarea name="message" placeholder="Mesaj" />
				<br></br>
				<button type="submit">Gönder</button>
			</form>

			<br></br>
			<Link href="/">Anasayfa</Link>
		</div>
	);
}

export default Page;

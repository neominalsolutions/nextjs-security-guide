import ContactForm from '@/app/components/ContactForm';
import Link from 'next/link';

export default function Page() {
	return (
		<>
			<ContactForm />
			<br></br>
			<Link href="/">Anasayfa</Link>
		</>
	);
}

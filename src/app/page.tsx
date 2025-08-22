import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import { logger } from './layout';

export default function Home() {
	logger.log('info', 'Anasayfaya erişim sağlandı');

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<Image
					className={styles.logo}
					src="/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>
				<Link href={'contact'}>CSRF Sample</Link>
				<Link href={'login'}>Secure JWT Login</Link>
				<Link href={'profile'}>Profile</Link>
				<Link href={'xss'}>
					Xss Sample (Input Validation, Html Sanitization)
				</Link>
				<Link href={'xss-dom'}>Xss DOM</Link>
				<Link href={'passwordSalt'}>Secure Password</Link>
				<Link href={'rsa'}>RSA OAEP Encrption</Link>
				<Link href={'aes'}>AES GCM Encrption</Link>
			</main>
		</div>
	);
}

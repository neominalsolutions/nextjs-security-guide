import { login } from '../../actions/auth/auth';

export default async function Page() {
	return (
		<div style={{ margin: 10 }}>
			<form action={login} className="flex flex-col gap-2">
				<input type="email" name="email" placeholder="Email" required />
				<br></br>
				<input type="password" name="password" placeholder="Şifre" required />
				<br></br>
				<button type="submit">Giriş Yap</button>
			</form>
		</div>
	);
}

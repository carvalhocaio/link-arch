import { AuthPageLayout } from "@/components/auth-page-layout";
import { LoginForm } from "@/components/login-form";

export default function SignInPage() {
	return (
		<AuthPageLayout>
			<LoginForm />
		</AuthPageLayout>
	);
}

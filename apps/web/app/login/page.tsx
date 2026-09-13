import type { Metadata } from "next";

import { AuthPageLayout } from "@/components/auth-page-layout";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
	title: "Sign in",
	description: "Sign in to manage your LinkArch short links.",
	robots: { index: false, follow: true },
};

export default function LoginPage() {
	return (
		<AuthPageLayout>
			<LoginForm />
		</AuthPageLayout>
	);
}

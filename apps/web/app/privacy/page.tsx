import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy Policy - Link Arch",
};

export default function PrivacyPage() {
	return (
		<div className="min-h-svh bg-background [background-image:none]">
			<div className="mx-auto max-w-3xl px-4 py-16">
				<div className="mb-4">
					<Link
						href="/sign-in"
						className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
					>
						&larr; Back
					</Link>
				</div>

				<article className="space-y-8">
					<header className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
						<p className="text-sm text-muted-foreground">Last updated: March 19, 2026</p>
					</header>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">1. Information We Collect</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							When you use Link Arch (&quot;the Service&quot;), we may collect:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>
								<strong>Account information:</strong> Name, email address, and an encrypted or
								hashed password used to create and protect your account.
							</li>
							<li>
								<strong>Session and security data:</strong> Session identifiers, IP address, and
								user-agent details associated with authentication and account security.
							</li>
							<li>
								<strong>Link data:</strong> The destination URLs you submit, generated short keys,
								link status, and optional expiration date.
							</li>
							<li>
								<strong>Usage data:</strong> Aggregate click counts for shortened links.
							</li>
							<li>
								<strong>Support communications:</strong> Information you include when you contact us
								through our support channels.
							</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We use the information we collect to:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>Provide, maintain, and improve the Service</li>
							<li>Create and manage your account</li>
							<li>Process and redirect shortened URLs</li>
							<li>Provide URL analytics and click tracking</li>
							<li>Detect and prevent abuse, spam, and malicious activity</li>
							<li>Communicate with you about the Service</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">3. How We Share Information</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We do not sell your personal information. We may share information with service
							providers that help us operate the Service (for example, hosting, database,
							authentication, and security providers), when required by law, or to protect our
							rights, users, and platform.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">4. Data Security</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We implement technical and organizational safeguards designed to protect personal
							information from unauthorized access, loss, misuse, and alteration. Passwords are not
							stored in plain text. However, no method of storage or transmission is completely
							secure.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">5. Cookies</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We use essential cookies and similar technologies required for authentication and
							session management. We do not use advertising cookies.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">6. Third-Party Links</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Shortened links can redirect to third-party websites. We are not responsible for the
							content, security, or privacy practices of those third-party sites.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">7. Data Retention</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We retain information for as long as necessary to provide the Service, maintain
							account security, comply with legal obligations, and resolve disputes. Retention
							periods may vary based on data type and legal requirements.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">8. Your Rights</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Depending on your location, you may have the following rights regarding your personal
							information:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>Access and receive a copy of your personal data</li>
							<li>Correct inaccurate personal data</li>
							<li>Request deletion of your personal data</li>
							<li>Object to or restrict the processing of your personal data</li>
							<li>Data portability</li>
						</ul>
						<p className="text-sm leading-relaxed text-muted-foreground">
							To exercise any of these rights, please contact us through the information provided
							below.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">9. Children&apos;s Privacy</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							The Service is not directed to children under 13, and we do not knowingly collect
							personal information from children under 13.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We may update this Privacy Policy from time to time. We will notify you of any changes
							by posting the new Privacy Policy on this page and updating the &quot;Last
							updated&quot; date. Your continued use of the Service after any changes constitutes
							acceptance of the updated policy.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">11. Contact</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							If you have any questions about this Privacy Policy, please contact us through our{" "}
							<a
								href="https://github.com/carvalhocaio/link-arch"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-4 hover:text-primary"
							>
								GitHub repository
							</a>
							.
						</p>
					</section>
				</article>
			</div>
		</div>
	);
}

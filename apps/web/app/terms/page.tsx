import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms of Service - Link Arch",
};

export default function TermsPage() {
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
						<h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
						<p className="text-sm text-muted-foreground">Last updated: March 19, 2026</p>
					</header>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">1. Agreement to Terms</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							By accessing or using Link Arch (&quot;the Service&quot;), you agree to be bound by
							these Terms of Service. If you do not agree to these terms, please do not use the
							Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">2. Eligibility and Accounts</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							You must be legally able to enter into a binding agreement to use the Service. You are
							responsible for maintaining the confidentiality of your account credentials and for
							all activity under your account.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">3. Description of Service</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Link Arch provides a URL shortening service that allows users to create shortened
							versions of long URLs. The Service may also provide analytics and management features
							for shortened URLs.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">4. Acceptable Use</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							You agree not to use the Service to:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>Shorten URLs that distribute malware, phishing, or malicious code</li>
							<li>Promote illegal activity, fraud, or harmful conduct</li>
							<li>Distribute spam, deceptive content, or unsolicited bulk messages</li>
							<li>Infringe intellectual property, privacy, or other rights of others</li>
							<li>Attempt to gain unauthorized access to the Service or related systems</li>
							<li>Interfere with, disrupt, or degrade service reliability or security</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">5. User Content and Links</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							You are responsible for the destination URLs and content you share through shortened
							links. You represent that you have the right to share such links and that they comply
							with applicable law and these Terms.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">6. Intellectual Property</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							The Service and its original content, features, and functionality are owned by Link
							Arch and are protected by copyright, trademark, and other intellectual property laws.
							You retain ownership of the URLs you shorten through the Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">7. Availability and Changes</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We may modify, suspend, or discontinue any part of the Service at any time, with or
							without notice. We are not liable for any modification, interruption, or
							discontinuance of the Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">8. Suspension and Termination</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We may terminate or suspend your account and access to the Service immediately,
							without prior notice, for any reason, including if you breach these Terms. Upon
							termination, your right to use the Service will cease immediately and your shortened
							URLs may be deactivated.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">9. Disclaimer of Warranties</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis
							without warranties of any kind, either express or implied, including but not limited
							to implied warranties of merchantability, fitness for a particular purpose, and
							non-infringement. We do not guarantee that the Service will be uninterrupted, secure,
							or error-free.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">10. Limitation of Liability</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							In no event shall Link Arch, its directors, employees, or agents be liable for any
							indirect, incidental, special, consequential, or punitive damages, including loss of
							profits, data, or other intangible losses, resulting from your use of or inability to
							use the Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">11. Indemnification</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							You agree to indemnify and hold harmless Link Arch and its operators from claims,
							liabilities, damages, and expenses arising from your use of the Service, your links,
							or your violation of these Terms.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">12. Governing Law</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							These Terms are governed by applicable laws in the jurisdiction of the Service
							operator, without regard to conflict of laws principles.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">13. Changes to Terms</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We reserve the right to modify these Terms at any time. We will notify users of
							significant changes by posting the updated Terms on the Service. Your continued use of
							the Service after any changes constitutes acceptance of the new Terms.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">14. Contact</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							If you have any questions about these Terms of Service, please contact us through our{" "}
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

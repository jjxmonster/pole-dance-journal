import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy/en")({
	component: PrivacyPolicyPage,
	head: () => ({
		meta: [
			{
				title: "Privacy Policy - Spinella",
			},
			{
				name: "description",
				content:
					"Spinella application privacy policy - learn how we protect your personal data and privacy.",
			},
			{
				name: "robots",
				content: "index, follow",
			},
		],
	}),
});

function PrivacyPolicyPage() {
	return (
		<div className="mx-auto max-w-4xl py-8">
			<article className="prose max-w-none px-6 py-8">
				<p>
					<strong>Last updated:</strong> November 10, 2025
				</p>
				<h2 id="1-data-controller">1. Data Controller</h2>
				<p>
					The data controller is Jakub Tarabasz, responsible for the development
					and operation of the "Spinella" application.
				</p>
				<p>
					You can contact the Controller at:{" "}
					<a href="mailto:kontakt@spinella.app">kontakt@spinella.app</a>
				</p>
				<h2 id="2-scope-of-collected-data">2. Scope of Collected Data</h2>
				<p>
					When using the Spinella application, we collect the following data:
				</p>
				<ul>
					<li>Basic user profile: email address</li>
					<li>
						Encrypted password (managed by Supabase Auth) and data from Google
						OAuth
					</li>
				</ul>
				<h2 id="3-legal-basis-for-processing">3. Legal Basis for Processing</h2>
				<p>The processing of personal data is based on:</p>
				<ul>
					<li>
						Art. 6(1)(b) GDPR – processing is necessary for the performance of a
						contract to which the data subject is party (using the Spinella.app
						application constitutes entering into an agreement for the provision
						of services by electronic means)
					</li>
					<li>
						Art. 6(1)(f) GDPR – processing is necessary for the purposes of the
						legitimate interests pursued by the controller (ensuring the
						security and functionality of the application)
					</li>
				</ul>
				<h2 id="4-purposes-of-data-processing">
					4. Purposes of Data Processing
				</h2>
				<p>Personal data is processed for the purpose of:</p>
				<ul>
					<li>
						Enabling registration and login to the Spinella.app application
					</li>
					<li>Ensuring the proper functioning of all application features</li>
					<li>Ensuring the security of application usage</li>
					<li>
						Contact regarding technical matters and handling user inquiries
					</li>
				</ul>
				<h2 id="5-method-and-place-of-processing">
					5. Method and Place of Processing
				</h2>
				<ul>
					<li>
						The application is hosted on Netlify infrastructure, which may use
						servers in various locations, including outside the European
						Economic Area.
					</li>
					<li>
						Data is stored in a Supabase database located in the eu-central-1
						region (Frankfurt, Germany), which means that the main user data
						remains within the European Union.
					</li>
				</ul>
				<h2 id="6-data-retention-period">6. Data Retention Period</h2>
				<p>
					User personal data is stored for the period of having an active
					account in the Spinella.app application. After account deletion, data
					is permanently deleted from our systems, except for data that may be
					stored longer due to applicable legal regulations (e.g., billing
					data).
				</p>
				<h2 id="7-data-recipients">7. Data Recipients</h2>
				<p>
					User data is not shared with any external companies except service
					providers necessary for the operation of the application:
				</p>
				<ul>
					<li>Supabase – database and authentication service provider</li>
					<li>Netlify – hosting and security service provider</li>
					<li>
						Google – authentication and authorization service provider in the
						case of logging in through Google OAuth (only basic profile data)
					</li>
				</ul>
				<p>
					These service providers have access to user data only to the extent
					necessary to provide their services and are subject to appropriate
					data protection obligations.
				</p>
				<h2 id="8-data-transfer-to-third-countries">
					8. Data Transfer to Third Countries
				</h2>
				<p>
					Due to the use of Netlify services, some data may be processed on
					servers located outside the European Economic Area (EEA). In such
					cases, we ensure that data transfer is carried out with appropriate
					safeguards, such as standard contractual clauses approved by the
					European Commission.
				</p>
				<h2 id="9-cookies-and-tracking-technologies">
					9. Cookies and Other Tracking Technologies
				</h2>
				<p>
					The Spinella.app application uses essential cookies necessary for the
					proper functioning of the application, in particular for user session
					management and security. These cookies are necessary for using the
					application and do not require separate user consent in accordance
					with legal regulations.
				</p>
				<h2 id="10-automated-decision-making-and-profiling">
					10. Automated Decision-Making and Profiling
				</h2>
				<p>
					The Spinella.app application does not use automated decision-making or
					profiling within the meaning of GDPR.
				</p>
				<h2 id="11-user-rights">11. User Rights</h2>
				<p>Each user has the following rights:</p>
				<ul>
					<li>Right of access to their personal data</li>
					<li>Right to rectification (correction) of their data</li>
					<li>Right to erasure (right to be forgotten)</li>
					<li>Right to restriction of processing</li>
					<li>Right to data portability</li>
					<li>Right to object to data processing</li>
					<li>
						Right to withdraw consent at any time, if processing is based on
						consent
					</li>
					<li>
						Right to lodge a complaint with a supervisory authority (President
						of the Personal Data Protection Office)
					</li>
				</ul>
				<p>
					To exercise the above rights, please contact us at:{" "}
					<a href="mailto:kontakt@spinella.app">kontakt@spinella.app</a>
				</p>
				<p>
					To delete your account, please send a message to{" "}
					<a href="mailto:kontakt@spinella.app">kontakt@spinella.app</a> with a
					request to delete your account.
				</p>
				<h2 id="12-security">12. Security</h2>
				<p>We make every effort to secure user data, including:</p>
				<ul>
					<li>Password encryption (we never store passwords in plain text)</li>
					<li>Security measures provided by Netlify and Supabase platforms</li>
					<li>Connection encryption using HTTPS protocol</li>
					<li>Regular security updates</li>
				</ul>
				<h2 id="13-privacy-policy-changes">13. Privacy Policy Changes</h2>
				<p>
					The Controller reserves the right to make changes to the Privacy
					Policy. Users will be informed of any changes via email associated
					with the user account. Using the application after changes have been
					made is equivalent to accepting the new version of the Privacy Policy.
				</p>
				<h2 id="14-final-provisions">14. Final Provisions</h2>
				<ul>
					<li>
						The application may contain links to external sites or services; we
						are not responsible for their privacy policies.
					</li>
					<li>
						By using the Spinella.app application, the user accepts this Privacy
						Policy.
					</li>
					<li>
						In matters not covered by this Privacy Policy, the relevant legal
						provisions shall apply, in particular Regulation (EU) 2016/679 of
						the European Parliament and of the Council of 27 April 2016 (GDPR).
					</li>
				</ul>{" "}
			</article>
		</div>
	);
}

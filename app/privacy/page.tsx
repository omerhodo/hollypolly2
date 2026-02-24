import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — HollyPolly',
  description: 'HollyPolly Privacy Policy',
};

export default function PrivacyPage() {
  const updated = 'February 24, 2026';

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 mb-8">Last updated: {updated}</p>

      <p className="mb-6">
        HollyPolly (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is a real-time lot-drawing
        and random team creation application. We are committed to protecting your privacy.
        This policy explains what data we collect, how we use it, and your rights.
      </p>

      {/* 1 */}
      <Section title="1. Information We Collect">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Display name</strong> — You voluntarily enter a name to join a room. This name
            is stored temporarily in a Firestore session document and is automatically deleted when
            the room is closed. We do not link it to any account or persistent identity.
          </li>
          <li>
            <strong>Room data</strong> — Options and participant lists you create are stored in
            Firebase Firestore only for the duration of your session.
          </li>
          <li>
            <strong>Device &amp; advertising identifiers</strong> — If you use the iOS or Android
            app, Google AdMob may collect your device&apos;s advertising identifier (IDFA / GAID)
            and usage data to serve relevant ads. This occurs only after you grant permission via
            Apple&apos;s App Tracking Transparency (ATT) prompt.
          </li>
          <li>
            <strong>Usage analytics</strong> — Firebase may collect anonymised crash and
            performance data to help us improve the app.
          </li>
        </ul>
      </Section>

      {/* 2 */}
      <Section title="2. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-2">
          <li>To provide real-time room functionality via Firebase Firestore.</li>
          <li>To display your chosen name to other participants in the same room.</li>
          <li>
            To serve ads through Google AdMob (mobile apps only). AdMob may use your advertising
            identifier for personalised ads if you grant ATT permission, or serve non-personalised
            ads if you decline.
          </li>
          <li>To monitor app stability through Firebase Crashlytics / Performance.</li>
        </ul>
      </Section>

      {/* 3 */}
      <Section title="3. Data Sharing">
        <p>We do not sell your personal data. Data may be shared with:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>Google / Firebase</strong> — for Firestore real-time database, authentication,
            and analytics services. See{' '}
            <a
              href="https://policies.google.com/privacy"
              className="text-orange-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Google AdMob</strong> — for ad serving in the mobile app. See{' '}
            <a
              href="https://support.google.com/admob/answer/6128543"
              className="text-orange-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              AdMob Privacy &amp; Data
            </a>
            .
          </li>
        </ul>
      </Section>

      {/* 4 */}
      <Section title="4. App Tracking Transparency (iOS)">
        <p>
          Our iOS app includes the{' '}
          <code className="bg-gray-100 px-1 rounded">NSUserTrackingUsageDescription</code> key
          because Google AdMob may request permission to track you across apps. When you open the
          app for the first time, iOS will display Apple&apos;s standard ATT permission dialog.
          Selecting <strong>Allow</strong> enables personalised ads; selecting{' '}
          <strong>Ask App Not to Track</strong> results in non-personalised ads. Either choice does
          not affect core app functionality.
        </p>
      </Section>

      {/* 5 */}
      <Section title="5. Data Retention">
        <p>
          Room data (names, options) is deleted from Firestore when the room is closed or
          automatically after 24 hours of inactivity. We do not maintain any long-term user
          database.
        </p>
      </Section>

      {/* 6 */}
      <Section title="6. Children&apos;s Privacy">
        <p>
          HollyPolly is rated 4+ and is suitable for all ages. We do not knowingly collect personal
          information from children under 13. If you believe a child has provided personal
          information, please contact us so we can delete it.
        </p>
      </Section>

      {/* 7 */}
      <Section title="7. Your Rights">
        <p>
          Depending on your location, you may have the right to access, correct, or delete any
          personal data we hold. Because we store no persistent user accounts, most data is already
          automatically ephemeral. For any requests, contact us at the address below.
        </p>
      </Section>

      {/* 8 */}
      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated date. Continued use of the app after changes constitutes acceptance of the
          new policy.
        </p>
      </Section>

      {/* 9 */}
      <Section title="9. Contact">
        <p>
          For privacy-related questions or data deletion requests, please contact us at:{' '}
          <a href="mailto:hello@hollypolly.app" className="text-orange-500 underline">
            hello@hollypolly.app
          </a>
        </p>
      </Section>

      <hr className="my-10 border-gray-200" />
      <p className="text-gray-400 text-xs">© 2026 HollyPolly. All rights reserved.</p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('privacy.meta');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      <p className="text-gray-400 mb-8">{t('lastUpdated')} {t('updatedDate')}</p>

      <p className="mb-6">{t('intro')}</p>

      {/* 1 */}
      <Section title={t('s1.title')}>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>{t('s1.nameLabel')}</strong> — {t('s1.nameText')}
          </li>
          <li>
            <strong>{t('s1.roomLabel')}</strong> — {t('s1.roomText')}
          </li>
          <li>
            <strong>{t('s1.adLabel')}</strong> — {t('s1.adText')}
          </li>
          <li>
            <strong>{t('s1.analyticsLabel')}</strong> — {t('s1.analyticsText')}
          </li>
        </ul>
      </Section>

      {/* 2 */}
      <Section title={t('s2.title')}>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t('s2.item1')}</li>
          <li>{t('s2.item2')}</li>
          <li>{t('s2.item3')}</li>
          <li>{t('s2.item4')}</li>
        </ul>
      </Section>

      {/* 3 */}
      <Section title={t('s3.title')}>
        <p>{t('s3.intro')}</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>{t('s3.googleLabel')}</strong> — {t('s3.googleText')}{' '}
            <a
              href="https://policies.google.com/privacy"
              className="text-orange-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('s3.googleLinkText')}
            </a>
            .
          </li>
          <li>
            <strong>{t('s3.admobLabel')}</strong> — {t('s3.admobText')}{' '}
            <a
              href="https://support.google.com/admob/answer/6128543"
              className="text-orange-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('s3.admobLinkText')}
            </a>
            .
          </li>
        </ul>
      </Section>

      {/* 4 */}
      <Section title={t('s4.title')}>
        <p>
          {t('s4.p1')}{' '}
          <code className="bg-gray-100 px-1 rounded">NSUserTrackingUsageDescription</code>{' '}
          {t('s4.p2')} <strong>{t('s4.allow')}</strong> {t('s4.p3')}{' '}
          <strong>{t('s4.deny')}</strong> {t('s4.p4')}
        </p>
      </Section>

      {/* 5 */}
      <Section title={t('s5.title')}>
        <p>{t('s5.text')}</p>
      </Section>

      {/* 6 */}
      <Section title={t('s6.title')}>
        <p>{t('s6.text')}</p>
      </Section>

      {/* 7 */}
      <Section title={t('s7.title')}>
        <p>{t('s7.text')}</p>
      </Section>

      {/* 8 */}
      <Section title={t('s8.title')}>
        <p>{t('s8.text')}</p>
      </Section>

      {/* 9 */}
      <Section title={t('s9.title')}>
        <p>
          {t('s9.text')}{' '}
          <a href="mailto:hello@hollypolly.app" className="text-orange-500 underline">
            hello@hollypolly.app
          </a>
        </p>
      </Section>

      <hr className="my-10 border-gray-200" />
      <p className="text-gray-400 text-xs">{t('copyright')}</p>
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

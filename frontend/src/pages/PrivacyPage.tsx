import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

        <div className="flex items-center gap-1.5 text-xs text-base-muted mb-8">
          <Link to="/" className="hover:text-base-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-base-black font-medium">Privacy Policy</span>
        </div>

        <h1 className="text-2xl font-bold text-base-black tracking-tight mb-1">Privacy Policy</h1>
        <p className="text-xs text-base-muted mb-10">Last updated: June 7, 2026</p>

        <div className="space-y-8 text-base-black">

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">1. Data Controller</h2>
            <p className="text-sm text-base-muted leading-relaxed">
              The data controller for Structify is the service operator. For any privacy-related
              requests, please contact us at:{' '}
              <a href="mailto:privacy@structify.app" className="text-pink-primary hover:underline">
                privacy@structify.app
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">2. What is Structify</h2>
            <p className="text-sm text-base-muted leading-relaxed">
              Structify is a web application that uses AI to automatically generate user stories and
              tasks for software projects. It is designed for developers, product managers, and teams
              who want to quickly structure their project ideas.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">3. Data We Collect</h2>
            <p className="text-sm text-base-muted leading-relaxed mb-3">We collect only what is necessary to provide the service:</p>
            <ul className="space-y-2">
              {[
                ['Account data', 'your email address and password (stored as a one-way hash — never in plain text)'],
                ['Groq API key (optional)', 'provided voluntarily if you want to use your personal quota; displayed partially masked in the UI'],
                ['Project content', 'titles, descriptions, and tasks of the projects you generate through the service'],
                ['Technical timestamps', 'creation and update times of your records (no IP addresses or browsing data are stored)'],
              ].map(([label, desc]) => (
                <li key={label} className="text-sm text-base-muted leading-relaxed pl-4 border-l-2 border-base-border">
                  <span className="font-medium text-base-black">{label}:</span> {desc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">4. Purpose and Legal Basis</h2>
            <p className="text-sm text-base-muted leading-relaxed mb-3">
              Your data is processed solely for the following purposes:
            </p>
            <ul className="space-y-2">
              {[
                ['Providing the service', 'performance of contract (Art. 6(1)(b) GDPR)'],
                ['Account management', 'performance of contract (Art. 6(1)(b) GDPR)'],
                ['AI content generation', 'performance of contract (Art. 6(1)(b) GDPR)'],
              ].map(([purpose, basis]) => (
                <li key={purpose} className="text-sm text-base-muted leading-relaxed pl-4 border-l-2 border-base-border">
                  <span className="font-medium text-base-black">{purpose}</span> — legal basis: {basis}
                </li>
              ))}
            </ul>
            <p className="text-sm text-base-muted leading-relaxed mt-3">
              We do not use your data for marketing, profiling, behavioural advertising, or analytics.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">5. Data Retention</h2>
            <p className="text-sm text-base-muted leading-relaxed">
              Your data is retained for as long as your account is active. When you delete your account,
              all associated data (projects, user stories, tasks, and API keys) is permanently and
              immediately erased. You can delete your account at any time from the{' '}
              <Link to="/settings" className="text-pink-primary hover:underline">Settings</Link> page.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">6. Third Parties</h2>
            <p className="text-sm text-base-muted leading-relaxed mb-3">
              We rely on one external provider to operate the service:
            </p>
            <div className="pl-4 border-l-2 border-base-border">
              <p className="text-sm text-base-muted leading-relaxed">
                <span className="font-medium text-base-black">Groq Inc.</span> — AI platform used to
                process project descriptions and generate structured content. The text you enter is sent
                to Groq's servers for processing. See{' '}
                <a
                  href="https://groq.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-primary hover:underline"
                >
                  Groq's Privacy Policy
                </a>{' '}
                for details.
              </p>
            </div>
            <p className="text-sm text-base-muted leading-relaxed mt-3">
              We do not sell, transfer, or share your personal data with any other third party.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">7. Cookies</h2>
            <p className="text-sm text-base-muted leading-relaxed">
              We use only strictly necessary technical cookies required to operate the service
              (e.g. authentication session management). We do not use tracking, profiling, or
              analytics cookies. No cookie consent banner is required for these cookies under
              Art. 122 of the Italian Privacy Code and applicable EU guidance.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">8. Your Rights (GDPR)</h2>
            <p className="text-sm text-base-muted leading-relaxed mb-3">
              Under Arts. 15–22 of the GDPR, you have the right to:
            </p>
            <ul className="space-y-1.5">
              {[
                ['Access (Art. 15)', 'obtain confirmation of processing and a copy of your data'],
                ['Rectification (Art. 16)', 'correct inaccurate or incomplete data'],
                ['Erasure (Art. 17)', 'have all your data deleted — you can do this directly from Settings'],
                ['Portability (Art. 20)', 'receive your data in a structured, machine-readable format'],
                ['Objection (Art. 21)', 'object to processing on legitimate grounds'],
                ['Restriction (Art. 18)', 'request that processing be restricted in certain circumstances'],
              ].map(([right, desc]) => (
                <li key={right} className="text-sm text-base-muted leading-relaxed pl-4 border-l-2 border-base-border">
                  <span className="font-medium text-base-black">{right}:</span> {desc}
                </li>
              ))}
            </ul>
            <p className="text-sm text-base-muted leading-relaxed mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@structify.app" className="text-pink-primary hover:underline">
                privacy@structify.app
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">9. Complaints</h2>
            <p className="text-sm text-base-muted leading-relaxed">
              You have the right to lodge a complaint with your local supervisory authority. In Italy:{' '}
              <a
                href="https://www.garanteprivacy.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-primary hover:underline"
              >
                Garante per la Protezione dei Dati Personali
              </a>{' '}
              (garanteprivacy.it).
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-black mb-2">10. Changes to This Policy</h2>
            <p className="text-sm text-base-muted leading-relaxed">
              Any changes to this policy will be published on this page with an updated date at the top.
              For material changes, registered users will be notified by email.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}

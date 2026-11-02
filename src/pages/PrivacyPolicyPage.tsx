import React from 'react';

export const PrivacyPolicyPage: React.FC = () => (
  <article className="mx-auto w-full max-w-3xl py-8 text-left">
    <h1 className="font-display text-3xl font-semibold text-on-surface">Privacy Policy</h1>
    <p className="mt-2 text-sm text-on-surface-variant">Last updated: October 27, 2026</p>

    <div className="mt-6 space-y-6 text-sm leading-relaxed text-on-surface-variant">
      <section>
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Data in this prototype
        </h2>
        <p className="mt-2">
          KAI stores demo profiles, chat history, mood entries, journal entries, preferences, and
          feedback in this browser. These are not secure accounts: the local email profile is a
          convenience feature and is not secure sign-in. This browser data is stored unencrypted.
          Anyone with access to the browser profile may be able to view it. Do not enter sensitive
          or identifying information.
        </p>
        <p className="mt-2">
          When you chat with KAI, the last 10 chat messages plus your new message are sent to the
          KAI server and forwarded to Google Gemini to generate a reply. The first-chat consent
          records only an acceptance timestamp in this browser. KAI does not provide account sync
          or emergency monitoring.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Optional nearby provider search
        </h2>
        <p className="mt-2">
          You can search by entering a city, area, or PIN code, or choose to share your current
          location using your browser. If you choose location access, your coordinates are sent to
          the KAI server and Google Places to find nearby listings. A typed location is also sent to
          those services for the search. KAI does not save the location or search results. You can
          deny location permission or use the manual search instead.
        </p>
        <p className="mt-2">
          Google processes information according to its{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline"
          >
            Privacy Policy
          </a>
          . Google Maps content is also subject to the{' '}
          <a
            href="https://cloud.google.com/maps-platform/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline"
          >
            Google Maps Platform Terms of Service
          </a>
          . Provider listings and phone numbers are not independently verified by KAI.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold text-on-surface">Your choices</h2>
        <p className="mt-2">
          You can avoid nearby search, decline the browser location prompt, or search using a
          general area instead. You can remove locally stored KAI data using the controls in
          Settings or by clearing this browser’s site data.
          Settings lets you export KAI data as JSON or delete all KAI-prefixed browser data.
        </p>
      </section>
    </div>
  </article>
);

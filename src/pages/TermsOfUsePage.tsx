import React from 'react';

export const TermsOfUsePage: React.FC = () => (
  <article className="mx-auto w-full max-w-3xl py-8 text-left">
    <h1 className="font-display text-3xl font-semibold text-on-surface">Terms of Use</h1>
    <p className="mt-2 text-sm text-on-surface-variant">Last updated: October 27, 2026</p>

    <div className="mt-6 space-y-6 text-sm leading-relaxed text-on-surface-variant">
      <section>
        <h2 className="font-headline text-lg font-semibold text-on-surface">Wellbeing support</h2>
        <p className="mt-2">
          KAI is a student wellbeing prototype for reflection. It is not a therapist, medical
          professional, diagnostic tool, or emergency service. It does not provide medical advice
          and cannot monitor or contact emergency services for you. For immediate danger in India,
          call 112; for mental health support, call Tele-MANAS at 14416.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Nearby provider listings
        </h2>
        <p className="mt-2">
          Nearby search uses Google Places. Listings, specialties, addresses, availability, and
          phone numbers may be incomplete or out of date and are not verified or endorsed by KAI.
          Confirm credentials and contact details directly before arranging care.
        </p>
        <p className="mt-2">
          Google Maps content accessed through this feature is subject to the{' '}
          <a
            href="https://cloud.google.com/maps-platform/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline"
          >
            Google Maps Platform Terms of Service
          </a>{' '}
          and Google’s{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Use of this prototype
        </h2>
        <p className="mt-2">
          Information and generated replies are provided for general wellbeing reflection and may be
          incomplete or inaccurate. Do not rely on KAI as a substitute for professional care.
        </p>
      </section>
    </div>
  </article>
);

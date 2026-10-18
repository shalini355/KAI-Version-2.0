import React, { useState } from 'react';

export const SupportPage: React.FC = () => {
  const [expandedResource, setExpandedResource] = useState<string | null>('anxiety');

  return (
    <div className="w-full flex flex-col gap-8 pt-2 text-left">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-on-surface tracking-tight">
          Support & Helplines
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant mt-1 max-w-xl">
          Kai is not a crisis service. If you need a person now, these public helplines can help you
          find support.
        </p>
      </div>

      {/* Immediate Crisis Helplines Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="font-headline font-semibold text-xl text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">phone_in_talk</span>
          <span>Public helplines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tele-MANAS Card */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
                  Toll-Free • 24/7
                </span>
                <span className="text-xs text-on-surface-variant">Govt of India</span>
              </div>
              <h3 className="font-headline font-semibold text-lg text-on-surface">Tele-MANAS</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                National Tele Mental Health Programme of India. Available in 20+ regional languages.
                Calls are free.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="font-headline font-bold text-lg text-primary">14416</span>
              <a
                href="tel:14416"
                className="h-10 px-5 rounded-full bg-primary text-on-primary font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Call 14416</span>
              </a>
            </div>
          </div>

          {/* iCall Helpline Card */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
                  Public helpline
                </span>
                <span className="text-xs text-on-surface-variant">TISS Mumbai</span>
              </div>
              <h3 className="font-headline font-semibold text-lg text-on-surface">
                iCall Psychosocial Support
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Psychosocial support by phone. Check iCall's website for current hours and service
                details.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="font-headline font-bold text-base text-secondary">9152987821</span>
              <a
                href="tel:9152987821"
                className="h-10 px-5 rounded-full bg-secondary text-on-secondary font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Call iCall</span>
              </a>
            </div>
          </div>

          {/* Emergency 112 Card */}
          <div className="p-6 rounded-2xl bg-error-container/20 border border-error/20 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error text-xs font-semibold">
                  Immediate Emergency
                </span>
                <span className="text-xs text-error font-medium">Pan-India</span>
              </div>
              <h3 className="font-headline font-semibold text-lg text-on-surface">
                National Emergency
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                If you or someone around you is in immediate physical danger or experiencing severe
                acute distress, call 112 instantly.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-error/15 flex items-center justify-between">
              <span className="font-headline font-bold text-lg text-error">112</span>
              <a
                href="tel:112"
                className="h-10 px-5 rounded-full bg-error text-on-error font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">emergency</span>
                <span>Call 112</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 md:p-8">
        <h2 className="font-headline font-semibold text-xl text-on-surface">
          Finding ongoing support
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          KAI does not provide counselling or maintain a verified provider directory. For ongoing
          support, ask your college student-support office or campus clinic what services are
          available, or speak with a licensed mental health professional. Confirm credentials,
          availability, fees, and confidentiality directly before sharing personal information.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          If you or someone else may be in immediate danger, call 112. For mental health support in
          India, Tele-MANAS can be reached at 14416.
        </p>
      </section>

      {/* Understanding What You're Feeling (Psychoeducation) */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-headline font-semibold text-xl text-on-surface">
            Understanding What You're Feeling
          </h2>
          <p className="text-xs text-on-surface-variant">
            Short explainers for common student stresses. They are not a diagnosis or a substitute
            for care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: 'anxiety',
              title: 'Anxiety & Tight Chest',
              summary: 'Why your body enters fight-or-flight over exams and deadlines.',
              body: 'Stress can show up as worry, restlessness, trouble concentrating, or physical tension. A short pause or one manageable next step may help in the moment. If it is intense, keeps returning, or affects daily life, consider speaking with a qualified professional.',
            },
            {
              id: 'burnout',
              title: 'Feeling depleted',
              summary: 'A reminder that exhaustion does not make you lazy.',
              body: 'Feeling depleted does not mean you are lazy. Notice which demands feel hard to sustain, take rest where you can, and talk with someone you trust. A qualified professional can help if exhaustion or distress continues.',
            },
            {
              id: 'catastrophizing',
              title: 'When worries snowball',
              summary: 'Try separating what you know from what you are imagining.',
              body: 'When one worry turns into a chain of worst-case possibilities, it may help to write down what you know, what is still uncertain, and one small next action. This is a reflection tool, not a diagnosis or a guarantee.',
            },
            {
              id: 'sleep',
              title: 'Late-Night Thought Spirals',
              summary: 'A low-pressure way to set a worry aside until later.',
              body: 'Worries can feel especially close when you are tired. If it helps, jot them down and return to them when you feel more rested; you do not have to solve everything right now. If sleep problems persist, consider talking with a health professional.',
            },
          ].map((resource) => {
            const isExpanded = expandedResource === resource.id;
            return (
              <div
                key={resource.id}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xs transition-all"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`support-resource-${resource.id}`}
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setExpandedResource(isExpanded ? null : resource.id)}
                >
                  <h3 className="font-headline font-semibold text-base text-on-surface">
                    {resource.title}
                  </h3>
                  <span
                    className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                <p className="text-xs text-on-surface-variant mt-1">{resource.summary}</p>
                {isExpanded && (
                  <p
                    id={`support-resource-${resource.id}`}
                    className="text-xs text-on-surface mt-3 pt-3 border-t border-outline-variant/10 leading-relaxed animate-in fade-in"
                  >
                    {resource.body}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

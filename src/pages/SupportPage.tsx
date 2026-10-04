import React, { useState } from 'react';

const SAMPLE_COUNSELORS = [
  {
    id: 'sample-1',
    title: 'Student counsellor',
    languages: ['Hindi', 'English'],
    specializations: ['Exam stress', 'Hostel adjustment'],
    availability: 'Sample hours: weekday afternoons',
    location: 'Kanpur · online or in person',
  },
  {
    id: 'sample-2',
    title: 'Youth wellbeing counsellor',
    languages: ['Hindi', 'English'],
    specializations: ['Placement stress', 'Confidence'],
    availability: 'Sample hours: evenings by appointment',
    location: 'Lucknow · online',
  },
  {
    id: 'sample-3',
    title: 'College wellbeing adviser',
    languages: ['Hindi', 'English'],
    specializations: ['Family pressure', 'Relationships'],
    availability: 'Sample hours: Monday to Friday',
    location: 'Prayagraj · in person',
  },
  {
    id: 'sample-4',
    title: 'Student support counsellor',
    languages: ['Hindi', 'English'],
    specializations: ['Burnout', 'Sleep routine'],
    availability: 'Sample hours: Saturday mornings',
    location: 'Varanasi · online',
  },
];

export const SupportPage: React.FC = () => {
  const [languageFilter, setLanguageFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [expandedResource, setExpandedResource] = useState<string | null>('anxiety');

  const filteredCounselors = SAMPLE_COUNSELORS.filter((counselor) => {
    const languageMatch = languageFilter === 'all' || counselor.languages.includes(languageFilter);
    const specializationMatch =
      specializationFilter === 'all' || counselor.specializations.includes(specializationFilter);
    return languageMatch && specializationMatch;
  });

  return (
    <div className="w-full flex flex-col gap-8 pt-2 text-left">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium mb-3">
          <span className="w-2 h-2 rounded-full bg-error" />
          <span>Support in India</span>
        </div>
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

      {/* Sample counsellor profiles */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline font-semibold text-xl text-on-surface">
              Available Support Specialists
            </h2>
            <p className="text-xs text-on-surface-variant">
              Browse specialists by language and focus area. Contact your institution or the
              helplines above to connect with a counsellor.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-surface-container-lowest text-xs text-on-surface px-3 py-1.5 rounded-full border border-outline-variant/15 focus:outline-none"
            >
              <option value="all">Language: All</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
            </select>

            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="bg-surface-container-lowest text-xs text-on-surface px-3 py-1.5 rounded-full border border-outline-variant/15 focus:outline-none"
            >
              <option value="all">Specialization: All</option>
              <option value="Exam stress">Exam stress</option>
              <option value="Hostel adjustment">Hostel adjustment</option>
              <option value="Placement stress">Placement stress</option>
              <option value="Family pressure">Family pressure</option>
              <option value="Burnout">Burnout</option>
            </select>
          </div>
        </div>

        {/* Profiles are examples only; no contact details are shown. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCounselors.map((counselor) => (
            <div
              key={counselor.id}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-dashed border-outline-variant/30 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-headline font-semibold text-base text-on-surface">
                    Verified Specialist
                  </h3>
                  <p className="text-xs text-on-surface-variant">{counselor.title}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {counselor.specializations.map((specialization) => (
                  <span
                    key={specialization}
                    className="px-2 py-1 rounded bg-surface-container text-[11px] text-on-surface"
                  >
                    {specialization}
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">
                {counselor.languages.join(', ')} · {counselor.location}
              </p>
              <p className="text-xs text-on-surface-variant">{counselor.availability}</p>
            </div>
          ))}
        </div>
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
              body: 'When your brain perceives a future threat (e.g. failing a semester, letting family down), your sympathetic nervous system floods adrenaline. Your lungs breathe shallowly and chest muscles tighten. The 4-second exhale stimulates the vagus nerve to send a chemical all-clear signal.',
            },
            {
              id: 'burnout',
              title: 'Student Burnout vs Laziness',
              summary: 'Why scrolling endlessly feels exhausting instead of restful.',
              body: 'Laziness is an active choice to enjoy relaxation. Burnout is a chronic state of emotional depletion where you feel guilty when resting, and overwhelmed when working. True recharge requires sensory rest without screens.',
            },
            {
              id: 'catastrophizing',
              title: 'Exam Season Catastrophizing',
              summary: 'How one delayed assignment snowballs into "my career is ruined".',
              body: 'Catastrophizing is a cognitive distortion that treats a 1% worst-case scenario as a 100% certainty. Writing down the intermediate steps breaks the spiral into manageable, concrete tasks.',
            },
            {
              id: 'sleep',
              title: 'Late-Night Thought Spirals',
              summary: 'Why worries look 10x heavier between 1 AM and 4 AM.',
              body: 'In the middle of the night, dopamine and executive prefrontal cortex functioning drop naturally. The brain struggles to problem-solve and defaults to rumination. Parking worries onto a night scratchpad tells your brain: "This is stored safely; we will handle it tomorrow."',
            },
          ].map((resource) => {
            const isExpanded = expandedResource === resource.id;
            return (
              <div
                key={resource.id}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xs transition-all"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
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
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{resource.summary}</p>
                {isExpanded && (
                  <p className="text-xs text-on-surface mt-3 pt-3 border-t border-outline-variant/10 leading-relaxed animate-in fade-in">
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

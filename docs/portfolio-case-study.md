# KAI: Making a little room to think

**Product:** Student wellbeing companion | **Format:** Responsive web app | **Design focus:** Low-pressure reflection, clear boundaries, and usable support paths

> This case study describes the shipped product and its design rationale. Before
> publishing it as personal portfolio work, make the contribution statement match
> your actual role and add any research or testing evidence you personally gathered.

## The design problem

Students can be carrying exam pressure, placement uncertainty, sleep disruption,
and everyday stress at the same time. A wellbeing tool can accidentally add to
that load when it feels clinical, asks for too much up front, or turns self-care
into another streak to maintain.

KAI explores a smaller invitation: give someone a few clear ways to start, let
them choose what feels manageable, and make it easy to reach a human support
service when a chat companion is not enough.

## Design intent

- **Start without pressure.** A person can talk, check in with a mood, write a
  note, or try a short breathing exercise without completing a setup checklist.
- **Make the next action clear.** Each area has a focused purpose and direct paths
  between related actions.
- **Use a warm, restrained visual language.** Soft neutral surfaces and deep
  green accents create hierarchy without making the interface feel clinical.
- **Be honest about the product.** Local profiles are not secure accounts,
  journal and mood data stay in the browser, and chat messages go to Gemini.
- **Keep the boundary visible.** KAI is not a therapist or crisis service;
  public support contacts remain available from the app.

## Key experience decisions

### A direct, human landing page

The landing page leads with what a person can do rather than a feature badge or
unverified promise. A clearly labelled sample conversation sets an expectation
for the tone while being distinct from a live session.

### Choice before commitment

The dashboard offers immediate ways into chat, mood check-in, and journaling.
Quick actions remain useful without requiring a user to build a routine or keep
a streak.

### Reflection tools that respect context

Mood entries, journal notes, and breathing sessions are optional. The mood view
uses a local calendar date, and the dashboard scratchpad shortcut opens the
editor directly so a person can capture a thought without hunting through tabs.

### Trust through truthful limits

The app labels browser-local profile behavior and storage plainly. It does not
present fictional counsellors as verified providers, and support pages point to
public helplines rather than implying the app can provide crisis care.

## What is implemented

- English and Hinglish chat with server-side Gemini replies
- Mood check-ins, weekly views, and local-date handling
- Browser-local journal and scratchpad
- Guided breathing and reflection prompts
- Public support links and crisis contact information
- Responsive navigation and a light/dark theme

## Validation and current limits

The current build passes the project's typecheck, lint, automated service tests,
and production build. Key flows have also been exercised manually: profile
creation and reopening, mood saving, journal persistence, the scratchpad
shortcut, and a live chat response.

This is implementation and flow validation, not evidence of usability outcomes.
No user-research findings or measured impact are claimed here. Profiles and
wellbeing notes are browser-local and not password-protected or synced. Chat
requires a configured Gemini API key and sends messages to that provider.

## Next design questions

1. Test the first-use flow with students who have different levels of comfort
   with wellbeing tools.
2. Check comprehension of local storage, provider sharing, and account limits
   before users enter personal information.
3. Review support-resource availability and wording with qualified local
   partners.
4. Validate readability, keyboard navigation, and screen-reader behavior with
   assistive-technology users.

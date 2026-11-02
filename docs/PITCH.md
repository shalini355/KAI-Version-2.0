# KAI — 3-Minute Hackathon Demo

## One-line problem

Students often need a private, immediate place to reflect after a difficult moment, but common support tools can feel clinical, impersonal, or inaccessible at late hours.

## Target user

College students and young adults in India who use English or conversational Hinglish and want low-pressure reflection tools alongside visible access to local support.

## Success metric

**Self-reported mood before and after:** users choose a mood intensity before and after a short chat, breathing, or journal session, then we compare the change as a prototype success signal—not a clinical outcome claim.

---

## Slide 1 — The problem (0:00–0:20)

**Presenter:** “It is 1 AM. A student has one exam behind them and placement pressure in front of them. They do not need a diagnosis, and they may not want a formal appointment. They need a small, understandable next step now.”

Show the landing page briefly.

**Key point:** KAI is positioned as a supportive reflection app, not therapy or an emergency service.

## Slide 2 — Story setup: Hinglish student chat (0:20–0:55)

Open KAI and sign in or continue through the local demo-profile flow.

At the chat screen, type:

> “Yaar, placements ki tension bahut ho rahi hai. Main kal exam ke baad bhi so nahi paya aur lag raha hai sab mujhse better manage kar rahe hain.”

**Presenter:** “The student is using Hinglish because that is natural for them. The current message and recent conversation context can be sent to Google Gemini, while KAI limits Gemini context to the last 10 messages.”

Show the empathetic chat reply. Explain that KAI asks first-chat consent, sends chat text to Gemini, and stores browser data unencrypted. Do not claim private or clinical confidentiality.

## Slide 3 — Breathing as a usable next step (0:55–1:25)

From the chat page, open the breathing exercise or use the quick micro-reset.

Start the box-breathing timer for one minute if demonstrating live.

**Presenter:** “Instead of overwhelming the student with advice, KAI offers a concrete pause. The wellness page also includes a breathing timer, journal prompts, affirmations, and activity logging.”

Use only the controls visible in the running app.

## Slide 4 — Mood before and after (1:25–1:55)

Open the Mood page and log the student’s mood before the activity.

Example:

- Mood: Anxious
- Intensity: 8/10
- Time: Night

After breathing, log again at a lower or honest intensity, such as 6/10. The demo should not pretend the user improved if the selection does not change.

**Presenter:** “Our proposed success measure is simple: did the self-reported mood intensity change from before to after the brief interaction? This is participant-reported reflection, not evidence that KAI treats anxiety.”

## Slide 5 — Crisis signal and safety flow (1:55–2:25)

Return to chat and type a clearly labeled test phrase such as:

> “I feel like everyone would be better without me.”

**Presenter:** “This message triggers KAI’s local high-risk detector. It opens the crisis flow and does not send the flagged message to Gemini.”

Walk through:

1. “Are you in immediate danger right now?”
2. If “Yes,” show the large tap-to-call buttons for 112 and Tele-MANAS 14416.
3. If “No,” show support options including Tele-MANAS, 112, and iCall, with an option to continue chatting.

Important: show the no-immediate-danger branch in the demo only if it is needed to explain support options. Do not present high-risk statements as gameplay or exaggerate a live emergency.

## Slide 6 — Failure fallback and privacy controls (2:25–2:45)

Briefly show that KAI provides static support if Gemini fails, returns empty output, or times out. Mention the fallback offers breathing, a journal prompt, and helpline numbers.

In Settings, briefly show:

- Export my data
- Delete all my data
- Local demo-profile explanation

**Presenter:** “The prototype is transparent about third-party Gemini text transmission and unencrypted browser storage. It also offers browser-data export and deletion.”

Do not claim encryption, secure sign-in, compliance, or account protection.

## Slide 7 — Limitations (2:45–3:00)

Present this limitations slide:

- KAI is a wellbeing prototype, not therapy or medical advice.
- The risk classifier is keyword and rule based, not clinically validated.
- Browser storage is unencrypted.
- Gemini output can be wrong or inappropriate.
- KAI does not diagnose, prescribe, monitor emergencies, or contact help automatically.
- Mood change is self-reported and is not proof of clinical effectiveness.
- Detection, clinician review, backend encryption, and retention controls are roadmap work.

**Close:** “KAI’s demo goal is a safe, human-sized first step for a stressed student: listen in their language, offer an immediate exercise, let them record a mood, and escalate clearly when risk language appears.”

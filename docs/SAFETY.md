# KAI Safety

## Detection approach

KAI uses a local, deterministic risk classifier before sending chat text to Google Gemini:

- Text is lowercased, punctuation is removed, repeated letters are collapsed, and whitespace is normalized.
- High-risk phrases include direct and indirect expressions of self-harm or suicide in English and Roman-script Hindi/Hinglish.
- Medium-risk phrases cover statements such as hopelessness or feeling unable to continue. A medium-risk message shows support options while the chat continues.
- High-risk messages open the immediate-danger crisis flow and are not sent to Gemini. KAI instead shows a static supportive response.
- The system prompt also tells Gemini not to diagnose, prescribe, name disorders, provide medication or dosage advice, claim clinical identity, promise outcomes, or encourage unsafe behavior.
- A crisis message acknowledged with “Continue talking” is handled with acknowledged state so it does not immediately reopen the same high-risk prompt.

The classifier is conservative for known idioms and explicit negations, including “This exam is killing me,” “I am dying of laughter,” “I do not want to die,” and “I am not suicidal.”

## Test results

Automated coverage is currently:

- Crisis phrase corpus: 50 phrases, with 20 high-risk, 10 medium-risk, and 20 low-risk/none cases.
- Crisis corpus result: 50/50 passing, as recorded by the automated test output.
- High-risk false negatives in the documented corpus: 0.
- Project Vitest suite: 28 tests passing across `tests/services.test.ts` and `tests/crisis.test.ts`.
- Prompt safety manual suite: 25 scenarios are documented in `tests/prompt-safety.md` for manual model response review. These scenarios have not been run automatically by the repository.
- Gemini failures are covered by tests for timeout-like rejection, HTTP 500 responses, and empty output. Those failures show a static fallback rather than raw provider or server error text.

## Known limitations

- The risk detector is phrase and normalization based. It can miss unseen wording, sarcasm, coded language, multiple languages, multilingual text, or ambiguous context.
- It can produce false positives where an indirect phrase resembles a crisis phrase without self-harm intent.
- Negation and false-alarm rules are deliberately limited and do not understand intent like a clinical model.
- The classifier is not a clinical assessment or diagnosis tool.
- Gemini can still generate inappropriate or inaccurate wellbeing content despite the system prompt.
- The crisis flow is a UI safeguard, not emergency monitoring and not a guarantee that help will be reached.
- KAI does not contact emergency services or a trusted person automatically.
- The browser stores chat sessions, profiles, mood entries, journal entries, preferences, feedback, and consent data unencrypted in `localStorage`.
- Only the last 10 Gemini context messages are sent by the current client and server implementation. Older browser history remains local unless deleted.
- Nearby search uses Google services and listings are not independently verified.
- The current automated tests do not validate real-world clinical safety end to end or human behavior after receiving crisis support.

## Roadmap

1. **Clinician review**
   - Add review by qualified mental-health professionals for crisis language, fallback copy, model instructions, and escalation language.
   - Define approved clinician-reviewed phrases and escalation content for English and Hinglish.
   - Conduct human red-team testing across context changes, negations, sarcasm, translation, and indirect expressions.

2. **Model-based risk classifier**
   - Move toward a separate risk-classification service or bounded model-assisted classifier with calibrated confidence thresholds.
   - Preserve deterministic rules as a fallback and defensive safety layer.
   - Add larger labeled datasets, false-positive and false-negative monitoring, multilingual cases, and offline evaluation.
   - Require human review of policy thresholds before deployment.

3. **Encrypted backend storage**
   - Replace or supplement browser-only storage with authenticated backend storage and encryption in transit and at rest.
   - Add least-privilege access, retention limits, secure key management, audit logging, and export/delete workflows.
   - Define whether chat text should be stored by the server at all, and consider privacy-preserving retention defaults.

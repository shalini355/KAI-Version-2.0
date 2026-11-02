import { describe, expect, it } from 'vitest';
import { assessRisk, normalizeRiskText } from '../src/services/chatService';

const HIGH_PHRASES = [
  'I want to die',
  'I think I will kill myself',
  'I am going to end it all',
  'I am thinking about suicide',
  'I want to hurt myself',
  'I should take my own life',
  'There is no reason for me to live',
  'I want to end my life',
  'Everyone would be better without me',
  'I really do not want to wake up',
  'Sab khatam kar du',
  'Jeene ka mann nahi',
  'Main mar jau',
  'Khud ko hurt kar sakta hoon',
  'Marna chahta hoon',
  'Marna chahti hoon',
  'Khatam karna chahta hoon',
  'Meri jaan le luga',
  'Khatam kar dungi main sab',
  'I am kiiiilling myself',
];

const MEDIUM_PHRASES = [
  "I can't take it anymore",
  'I cannot take this anymore',
  'I am feeling hopeless',
  "I don't see a way out",
  'I have no hope left',
  'Nothing seems to matter anymore',
  'I have given up on life',
  'I am fed up with life',
  'Kuch achha nahi lag raha',
  'Zindagi se thak gaya hoon',
];

const NONE_PHRASES = [
  'This exam is killing me',
  'I am dying of laughter',
  'The workout is killing me',
  'My boss is killing me with emails',
  'This traffic is killing me',
  'I loved that movie',
  'I am feeling stressed about placements',
  'The coffee is too strong',
  'I need help studying for my viva',
  'I want to talk to a friend',
  'I am not suicidal',
  'I do not want to die',
  'I would never hurt myself',
  'That was a joke about wanting to die',
  "I'm not going to kill myself",
  "I'm safe right now",
  'Suicide prevention is important',
  'The documentary discussed self-harm',
  'I love my life',
  'We talked about feeling hopeless in a movie',
];

describe('assessRisk crisis phrase corpus', () => {
  it('matches the labeled corpus and reports a pass-rate summary', () => {
    const falseNegatives: string[] = [];
    const falsePositives: string[] = [];
    const otherFailures: string[] = [];
    let failures = 0;

    for (const phrase of HIGH_PHRASES) {
      const actual = assessRisk(phrase);
      if (actual !== 'high') {
        failures += 1;
        falseNegatives.push(`high: "${phrase}" -> ${actual}`);
      }
    }
    for (const phrase of MEDIUM_PHRASES) {
      const actual = assessRisk(phrase);
      if (actual !== 'medium') {
        failures += 1;
        otherFailures.push(`medium: "${phrase}" -> ${actual}`);
      }
    }
    for (const phrase of NONE_PHRASES) {
      const actual = assessRisk(phrase);
      if (actual !== 'none') {
        failures += 1;
        falsePositives.push(`none: "${phrase}" -> ${actual}`);
      }
    }

    const total = HIGH_PHRASES.length + MEDIUM_PHRASES.length + NONE_PHRASES.length;
    const passed = total - failures;
    console.log(
      `Crisis detector pass rate: ${passed}/${total} (${((passed / total) * 100).toFixed(1)}%)`,
    );
    if (falseNegatives.length > 0) {
      console.log(`High-risk false negatives (${falseNegatives.length}):`);
      console.log(falseNegatives.join('\n'));
    }
    if (otherFailures.length > 0) console.log(otherFailures.join('\n'));
    if (falsePositives.length > 0) console.log(falsePositives.join('\n'));

    expect(falseNegatives).toEqual([]);
    expect(passed).toBe(total);
  });

  it('normalizes punctuation, spacing, and repeated letters', () => {
    expect(normalizeRiskText('  I   want---to DIIIIE!!!  ')).toBe('i want to die');
    expect(normalizeRiskText('Sooo tired, pleeease')).toBe('so tired please');
  });
});

interface KaiSpeechRecognitionResult {
  readonly transcript: string;
}

interface KaiSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ArrayLike<ArrayLike<KaiSpeechRecognitionResult>>;
}

interface KaiSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: KaiSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface Window {
  webkitAudioContext?: typeof AudioContext;
  SpeechRecognition?: new () => KaiSpeechRecognition;
  webkitSpeechRecognition?: new () => KaiSpeechRecognition;
}

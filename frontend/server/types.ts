export type AccessibilityMode = "esl" | "adhd" | "dyslexia";

export interface GlossaryTerm {
  term: string;          // Exact technical English term from the lecture
  simpleEnglish: string; // 1-sentence plain-English explanation
  french: string;        // French equivalent or short meaning
  darija: string;        // Natural Moroccan Darija explanation (Latin script)
}

export interface MicroCard {
  id: number;
  title: string;            // 3-6 word heading
  estimatedMinutes: number; // 2 or 3
  keyPoints: string[];      // Max 3 concise bullets
  recallQuestion: string;
  recallAnswer: string;
}

export interface DigestResponse {
  id: string;
  fileName: string;
  title: string;
  overview: string;         // 2-3 sentence big picture
  glossary: GlossaryTerm[]; // 6-10 hardest technical terms
  microCards: MicroCard[];  // 4-6 bite-sized flashcards
  audioScript: string;      // Clean 60-90s spoken summary (no symbols/markdown)
  cached: boolean;          // true if returned from PostgreSQL cache
}

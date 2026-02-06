
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface GenerationResult {
  flashcards: Flashcard[];
  summary: string;
  keyTakeaways: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  QUIZ = 'QUIZ',
  STUDY = 'STUDY'
}

export interface Theme {
  name: string;
  primary: string; // "79 70 229"
  primaryHover: string;
  secondary: string;
  shadow: string;
}

export interface QuizState {
  currentIndex: number;
  knownIds: Set<string>;
  unknownIds: Set<string>;
  isFinished: boolean;
}

export interface AdditionalInfo {
  explanation: string;
  sources: { title: string; uri: string }[];
}

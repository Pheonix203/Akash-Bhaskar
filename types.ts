
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
  SUCCESS = 'SUCCESS'
}

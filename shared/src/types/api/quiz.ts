export interface Quiz {
  id: string;
  title: string;
  developer: string;
  tags: string[];
  rating: number;
  players: number;
  achievements: number;
  totalAchievements: number;
  author: string;

  backgroundImageUrl: string;
}

export interface GetQuizListResponse {
  data: Quiz[];
}

export interface Answer {
  content: string;
  correct: boolean;
}

export interface Question {
  id: string;
  quiz: string;
  question: string;
  image: string | null;
  answers: Answer[];
}

export interface GetQuestionListResponse {
  data: Question[];
}
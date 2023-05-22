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
  id: string;
  content: string;
}

export type AnswerVerbose = Answer & {
  correct: boolean;
};

export interface Question<T extends Answer> {
  id: string;
  quizId: string;
  question: string;
  image: string | null;
  answers: T[];
}

export interface GetQuestionListResponse {
  data: Question<AnswerVerbose>[];
}

export interface Round {
  index: number;
  startedAt: number;
  endedAt: number | null;
  response: string | null;
  correctResponse: string;
}

export interface Game {
  id: string;
  quizId: string;
  userId: string | null;
  currentQuestion: number;
  totalQuestions: number;
  rounds: Round[];
}

export interface PostGameStartResponse {
  data: Game;
}

export interface GetGameQuestionResponse {
  data: {
    id: string;
    quizId: string;
    question: string;
    image: string | null;
    answers: Answer[];
  };
}

export interface PostGameAnswerRequest {
  answerId: string;
}

export interface PostGameAnswerResponse {
  data: Game;
  correct: boolean;
  correctResponse: string;
}

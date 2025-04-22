export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionCount: number;
  tags: string[];
}

export interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_options: string[];
}

export interface UserAnswer {
  questionIndex: number;
  isCorrect: boolean;
  answer: string | null;
  correctAnswer: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  userAnswers: UserAnswer[];
  timeLeft: number;
  isAnswerSelected: boolean;
  showFeedback: boolean;
  feedbackType: "correct" | "incorrect" | "timeout" | null;
  selectedOptionId: string | null;
  powerUps: {
    fiftyFifty: boolean;
    hint: boolean;
    skip: boolean;
  };
  removedOptions: string[];
}

export interface GameStats {
  userId: string;
  username: string | null;
  score: number;
  categoryId: number;
  difficulty: string;
  correctAnswers: number;
  incorrectAnswers: number;
  datePlayed: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string | null;
  score: number;
  categoryId: number;
  difficulty: string;
  datePlayed: string;
}

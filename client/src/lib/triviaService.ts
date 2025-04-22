import { apiRequest } from "@/lib/queryClient";
import { Question, Category } from "@/lib/types";
import { shuffle } from "@/lib/utils";

// Function to fetch categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiRequest("GET", "/api/trivia/categories");
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Function to fetch questions
export const fetchQuestions = async (
  categoryId: number | string,
  difficulty: string,
  amount: number = 10
): Promise<Question[]> => {
  try {
    const response = await apiRequest(
      "GET",
      `/api/trivia/questions?category=${categoryId}&difficulty=${difficulty}&amount=${amount}`
    );
    
    const questions: Question[] = await response.json();
    
    // Process questions to add all_options array with shuffled options
    return questions.map(question => ({
      ...question,
      all_options: shuffle([...question.incorrect_answers, question.correct_answer])
    }));
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

// Function to save game stats
export const saveGameStats = async (
  userId: string,
  categoryId: number,
  difficulty: string,
  score: number,
  correctAnswers: number,
  incorrectAnswers: number
) => {
  try {
    await apiRequest("POST", "/api/trivia/stats", {
      userId,
      categoryId,
      difficulty,
      score,
      correctAnswers,
      incorrectAnswers,
      datePlayed: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving game stats:", error);
    throw error;
  }
};

// Function to fetch leaderboard
export const fetchLeaderboard = async (
  categoryId?: number,
  difficulty?: string,
  limit: number = 10
) => {
  try {
    let url = `/api/trivia/leaderboard?limit=${limit}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    
    const response = await apiRequest("GET", url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

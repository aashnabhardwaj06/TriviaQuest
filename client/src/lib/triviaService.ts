import { apiRequest } from "@/lib/queryClient";
import { Question, Category } from "@/lib/types";
import { shuffle } from "@/lib/utils";

// Function to determine if we should use external API
const useExternalApi = () => {
  return window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit');
};

// Function to fetch categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    if (useExternalApi()) {
      // For deployment - use a direct fetch to Open Trivia DB API
      const response = await fetch('https://opentdb.com/api_category.php');
      const data = await response.json();
      
      // Transform the data to match our expected format
      return data.trivia_categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: `Questions about ${cat.name}`,
        icon: '🧠',
        color: '#6366f1',
        questionCount: 50,
        tags: [cat.name.split(':')[0]]
      }));
    } else {
      // For local development - use our backend
      const response = await apiRequest("GET", "/api/trivia/categories");
      return await response.json();
    }
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
    let questions: Question[];
    
    if (useExternalApi()) {
      // For deployment - use direct fetch to Open Trivia DB API
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`
      );
      const data = await response.json();
      
      if (data.response_code !== 0) {
        throw new Error('Failed to fetch questions from API');
      }
      
      questions = data.results;
    } else {
      // For local development - use our backend
      const response = await apiRequest(
        "GET",
        `/api/trivia/questions?category=${categoryId}&difficulty=${difficulty}&amount=${amount}`
      );
      questions = await response.json();
    }
    
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
export const saveGameStats = async (stats: {
  userId: string;
  username: string | null;
  categoryId: number;
  difficulty: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  datePlayed: Date | string;
}) => {
  // If we're using external API, just log the stats - for real deployment
  // we could implement a simple analytics service or localStorage
  if (useExternalApi()) {
    console.log('Game stats would be saved in deployed app:', stats);
    // We could store in localStorage if needed
    try {
      const existingStats = JSON.parse(localStorage.getItem('triviaStats') || '[]');
      existingStats.push({
        ...stats, 
        datePlayed: stats.datePlayed instanceof Date ? 
          stats.datePlayed.toISOString() : 
          stats.datePlayed
      });
      localStorage.setItem('triviaStats', JSON.stringify(existingStats));
    } catch (e) {
      // Silently fail for localStorage
      console.error('Failed to save to localStorage', e);
    }
    return;
  }
  
  // For local development - use our backend
  try {
    await apiRequest("POST", "/api/trivia/stats", {
      ...stats,
      datePlayed: stats.datePlayed instanceof Date ? 
        stats.datePlayed.toISOString() : 
        stats.datePlayed
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
    // If using external API, retrieve from localStorage
    if (useExternalApi()) {
      try {
        const savedStats = JSON.parse(localStorage.getItem('triviaStats') || '[]');
        
        // Filter based on criteria
        let filtered = savedStats;
        if (categoryId !== undefined) {
          filtered = filtered.filter((stat: any) => stat.categoryId === categoryId);
        }
        if (difficulty) {
          filtered = filtered.filter((stat: any) => stat.difficulty === difficulty);
        }
        
        // Sort by score (highest first)
        filtered.sort((a: any, b: any) => b.score - a.score);
        
        // Limit results
        return filtered.slice(0, limit);
      } catch (e) {
        console.error('Failed to retrieve from localStorage', e);
        return [];
      }
    }
    
    // For local development - use our backend
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

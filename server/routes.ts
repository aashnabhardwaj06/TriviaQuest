import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { GameStats, insertGameStatsSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Categories endpoint
  router.get("/trivia/categories", async (req, res) => {
    try {
      const response = await axios.get("https://opentdb.com/api_category.php");
      
      // Map the API response to our Category format
      const categoryMapping: Record<number, any> = {
        9: { 
          icon: "fas fa-globe", 
          color: "primary", 
          description: "Test your knowledge about everything under the sun",
          questionCount: 300,
          tags: ["Popular"]
        },
        10: { 
          icon: "fas fa-book", 
          color: "blue", 
          description: "Challenge yourself with literary works and authors",
          questionCount: 140,
          tags: ["Educational"]
        },
        11: { 
          icon: "fas fa-film", 
          color: "secondary", 
          description: "Challenge yourself with questions about cinema",
          questionCount: 220,
          tags: ["Popular"]
        },
        12: { 
          icon: "fas fa-music", 
          color: "pink", 
          description: "Test your knowledge of musicians, bands and albums",
          questionCount: 160,
          tags: ["Fun"]
        },
        13: { 
          icon: "fas fa-theater-masks", 
          color: "accent", 
          description: "Questions about musicals, plays and performances",
          questionCount: 130,
          tags: ["Entertainment"]
        },
        14: { 
          icon: "fas fa-tv", 
          color: "secondary", 
          description: "Quiz yourself on TV shows and characters",
          questionCount: 200,
          tags: ["Entertainment"]
        },
        15: { 
          icon: "fas fa-gamepad", 
          color: "blue", 
          description: "Prove your gaming knowledge",
          questionCount: 180,
          tags: ["Entertainment"]
        },
        16: { 
          icon: "fas fa-chess", 
          color: "secondary", 
          description: "Board games, card games, and more",
          questionCount: 140,
          tags: ["Fun"]
        },
        17: { 
          icon: "fas fa-microscope", 
          color: "accent", 
          description: "Explore the wonders of the natural world",
          questionCount: 190,
          tags: ["Educational"]
        },
        18: { 
          icon: "fas fa-laptop-code", 
          color: "primary", 
          description: "Test your knowledge of computers and technology",
          questionCount: 160,
          tags: ["Educational"]
        },
        19: { 
          icon: "fas fa-square-root-alt", 
          color: "accent", 
          description: "Challenge yourself with mathematical puzzles",
          questionCount: 120,
          tags: ["Educational"]
        },
        20: { 
          icon: "fas fa-landmark", 
          color: "secondary", 
          description: "Questions about mythology from around the world",
          questionCount: 130,
          tags: ["Educational"]
        },
        21: { 
          icon: "fas fa-futbol", 
          color: "blue", 
          description: "Challenge your sports knowledge",
          questionCount: 170,
          tags: ["Competitive"]
        },
        22: { 
          icon: "fas fa-map-marked-alt", 
          color: "pink", 
          description: "Test your knowledge of locations around the world",
          questionCount: 150,
          tags: ["Educational"]
        },
        23: { 
          icon: "fas fa-history", 
          color: "orange", 
          description: "Travel back in time with historical questions",
          questionCount: 180,
          tags: ["Educational"]
        },
        24: { 
          icon: "fas fa-landmark", 
          color: "orange", 
          description: "Test your knowledge of government and politics",
          questionCount: 130,
          tags: ["Educational"]
        },
        25: { 
          icon: "fas fa-palette", 
          color: "pink", 
          description: "Questions about artists, paintings and art history",
          questionCount: 110,
          tags: ["Creative"]
        },
        26: { 
          icon: "fas fa-users", 
          color: "primary", 
          description: "Explore questions about celebrities and famous people",
          questionCount: 140,
          tags: ["Entertainment"]
        },
        27: { 
          icon: "fas fa-paw", 
          color: "accent", 
          description: "Test your knowledge of the animal kingdom",
          questionCount: 150,
          tags: ["Educational"]
        },
        28: { 
          icon: "fas fa-car", 
          color: "blue", 
          description: "Questions about vehicles, racing, and more",
          questionCount: 120,
          tags: ["Specialized"]
        },
        29: { 
          icon: "fas fa-book-open", 
          color: "orange", 
          description: "Test your knowledge of comic characters and storylines",
          questionCount: 130,
          tags: ["Entertainment"]
        },
        30: { 
          icon: "fas fa-utensils", 
          color: "secondary", 
          description: "Food, ingredients, and cooking techniques",
          questionCount: 120,
          tags: ["Lifestyle"]
        },
        31: { 
          icon: "fas fa-flask", 
          color: "accent", 
          description: "Explore the world of Japanese animation",
          questionCount: 110,
          tags: ["Entertainment"]
        },
        32: { 
          icon: "fas fa-paint-brush", 
          color: "pink", 
          description: "Test your knowledge of animation and cartoons",
          questionCount: 100,
          tags: ["Entertainment"]
        }
      };
      
      const categories = response.data.trivia_categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: categoryMapping[category.id]?.description || "Test your knowledge in this category",
        icon: categoryMapping[category.id]?.icon || "fas fa-question",
        color: categoryMapping[category.id]?.color || "primary",
        questionCount: categoryMapping[category.id]?.questionCount || 100,
        tags: categoryMapping[category.id]?.tags || ["General"]
      }));
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories from the trivia API" });
    }
  });
  
  // Questions endpoint
  router.get("/trivia/questions", async (req, res) => {
    const { category, difficulty, amount = 10 } = req.query;
    
    if (!category || !difficulty) {
      return res.status(400).json({ message: "Category and difficulty are required" });
    }
    
    try {
      const response = await axios.get("https://opentdb.com/api.php", {
        params: {
          amount,
          category,
          difficulty,
          encode: "base64" // To handle special characters
        }
      });
      
      if (response.data.response_code !== 0) {
        return res.status(404).json({ 
          message: "No questions found for the selected category and difficulty" 
        });
      }
      
      // Decode the base64 encoding and format questions
      const formattedQuestions = response.data.results.map((q: any) => ({
        category: Buffer.from(q.category, 'base64').toString(),
        type: Buffer.from(q.type, 'base64').toString(),
        difficulty: Buffer.from(q.difficulty, 'base64').toString(),
        question: Buffer.from(q.question, 'base64').toString(),
        correct_answer: Buffer.from(q.correct_answer, 'base64').toString(),
        incorrect_answers: q.incorrect_answers.map((a: string) => 
          Buffer.from(a, 'base64').toString()
        )
      }));
      
      res.json(formattedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions from the trivia API" });
    }
  });
  
  // Save game stats
  router.post("/trivia/stats", async (req, res) => {
    try {
      const gameStatsData = insertGameStatsSchema.parse(req.body);
      const savedStats = await storage.saveGameStats(gameStatsData);
      res.status(201).json(savedStats);
    } catch (error) {
      console.error("Error saving game stats:", error);
      
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid game stats data", 
          errors: error.errors.map(e => e.message).join(", ")
        });
      } else {
        res.status(500).json({ message: "Failed to save game stats" });
      }
    }
  });
  
  // Fetch leaderboard
  router.get("/trivia/leaderboard", async (req, res) => {
    try {
      const { categoryId, difficulty, limit = 10 } = req.query;
      
      const leaderboard = await storage.getLeaderboard(
        categoryId ? Number(categoryId) : undefined,
        difficulty as string | undefined,
        Number(limit)
      );
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  
  app.use("/api", router);
  
  // Create and return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

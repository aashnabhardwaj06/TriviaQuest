import { GameStats, InsertGameStats, LeaderboardEntry, User, type InsertUser } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game stats operations
  saveGameStats(stats: InsertGameStats): Promise<GameStats>;
  getGameStatsByUserId(userId: string): Promise<GameStats[]>;
  getLeaderboard(categoryId?: number, difficulty?: string, limit?: number): Promise<LeaderboardEntry[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameStats: Map<number, GameStats>;
  private userIdCounter: number;
  private gameStatsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.gameStats = new Map();
    this.userIdCounter = 1;
    this.gameStatsIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Game stats operations
  async saveGameStats(stats: InsertGameStats): Promise<GameStats> {
    const id = this.gameStatsIdCounter++;
    const gameStats: GameStats = { ...stats, id };
    this.gameStats.set(id, gameStats);
    return gameStats;
  }
  
  async getGameStatsByUserId(userId: string): Promise<GameStats[]> {
    return Array.from(this.gameStats.values()).filter(
      (stats) => stats.userId === userId
    );
  }
  
  async getLeaderboard(
    categoryId?: number, 
    difficulty?: string, 
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    let filteredStats = Array.from(this.gameStats.values());
    
    // Apply filters if provided
    if (categoryId !== undefined) {
      filteredStats = filteredStats.filter(stats => stats.categoryId === categoryId);
    }
    
    if (difficulty) {
      filteredStats = filteredStats.filter(stats => stats.difficulty === difficulty);
    }
    
    // Convert to leaderboard entries and sort by score (descending)
    const leaderboardEntries: LeaderboardEntry[] = filteredStats.map(stats => ({
      id: stats.id,
      username: stats.username,
      score: stats.score,
      categoryId: stats.categoryId,
      difficulty: stats.difficulty,
      datePlayed: stats.datePlayed
    }));
    
    // Sort by score (highest first)
    leaderboardEntries.sort((a, b) => b.score - a.score);
    
    // Return top N entries
    return leaderboardEntries.slice(0, limit);
  }
}

// Export storage instance
export const storage = new MemStorage();

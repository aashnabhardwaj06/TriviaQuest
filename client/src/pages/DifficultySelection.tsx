import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DifficultyCard from "@/components/DifficultyCard";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { useState } from "react";

type Difficulty = "easy" | "medium" | "hard";

export default function DifficultySelection() {
  const { categoryId, categoryName } = useParams();
  const [, setLocation] = useLocation();
  const { playSound } = useSoundEffect();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  
  const decodedCategoryName = decodeURIComponent(categoryName || "");

  const handleDifficultySelect = (difficulty: Difficulty) => {
    playSound("click");
    setSelectedDifficulty(difficulty);
  };

  const handleBackToCategories = () => {
    playSound("click");
    setLocation("/categories");
  };

  const handleStartQuiz = () => {
    if (!selectedDifficulty) {
      // Show toast or other notification
      return;
    }
    playSound("success");
    setLocation(`/quiz/${categoryId}/${categoryName}/${selectedDifficulty}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen py-12 px-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center text-primary mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Select Difficulty
        </motion.h2>
        
        <motion.p 
          className="text-center text-gray-600 mb-4"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          How challenging do you want your questions to be?
        </motion.p>
        
        <motion.p 
          className="text-center text-primary font-semibold mb-10"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {decodedCategoryName}
        </motion.p>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
          variants={containerVariants}
        >
          <DifficultyCard 
            difficulty="easy"
            isSelected={selectedDifficulty === "easy"}
            onClick={() => handleDifficultySelect("easy")}
            icon="fas fa-baby"
            color="green"
            title="Easy"
            description="Perfect for beginners or a relaxed game"
            features={[
              "Simple questions",
              "General knowledge",
              "More time per question"
            ]}
            badge="★ Beginner friendly"
          />
          
          <DifficultyCard 
            difficulty="medium"
            isSelected={selectedDifficulty === "medium"}
            onClick={() => handleDifficultySelect("medium")}
            icon="fas fa-user"
            color="yellow"
            title="Medium"
            description="Balanced challenge for most players"
            features={[
              "Moderate difficulty",
              "Mix of common and specific knowledge",
              "Standard time limit"
            ]}
            badge="★★ Most popular"
          />
          
          <DifficultyCard 
            difficulty="hard"
            isSelected={selectedDifficulty === "hard"}
            onClick={() => handleDifficultySelect("hard")}
            icon="fas fa-crown"
            color="red"
            title="Hard"
            description="For experts and true trivia enthusiasts"
            features={[
              "Challenging questions",
              "Specialized knowledge",
              "Shorter time limit"
            ]}
            badge="★★★ Expert level"
          />
        </motion.div>
        
        <motion.div 
          className="text-center mt-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            variant="outline"
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-full mr-4 transition-all"
            onClick={handleBackToCategories}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </Button>
          
          <Button 
            className={`bg-primary hover:bg-purple-800 text-white font-semibold py-3 px-8 rounded-full transition-all ${!selectedDifficulty ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleStartQuiz}
            disabled={!selectedDifficulty}
          >
            Start Quiz <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

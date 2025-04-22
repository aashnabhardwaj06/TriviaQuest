import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSoundEffect } from "@/hooks/useSoundEffect";

export default function Home() {
  const [, setLocation] = useLocation();
  const { playSound } = useSoundEffect();
  
  const handleStartGame = () => {
    playSound("click");
    setLocation("/categories");
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <motion.h1 
          className="text-5xl md:text-6xl font-bold text-primary mb-6"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ 
            type: "spring", 
            duration: 0.8, 
            repeat: Infinity, 
            repeatType: "reverse",
            repeatDelay: 2
          }}
        >
          <i className="fas fa-brain text-secondary mr-3"></i>Trivia Quest
        </motion.h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
          Test your knowledge with thousands of questions across multiple categories and difficulty levels!
        </p>
        
        <div className="flex justify-center mb-8">
          <motion.div 
            className="relative w-64 h-64"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="absolute inset-0 bg-secondary rounded-full opacity-10"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
            <motion.div 
              className="absolute inset-4 bg-primary rounded-full flex items-center justify-center cursor-pointer"
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
            >
              <span className="text-white font-bold text-4xl">PLAY</span>
            </motion.div>
          </motion.div>
        </div>
        
        <Button 
          className="bg-primary hover:bg-purple-800 text-white font-semibold text-xl py-8 px-10 rounded-full transition-all duration-300 transform hover:scale-105"
          onClick={handleStartGame}
        >
          START ADVENTURE
        </Button>
        
        <div className="mt-12 flex flex-col md:flex-row justify-center gap-4">
          <button className="text-gray-600 hover:text-primary flex items-center justify-center gap-2 transition-colors">
            <i className="fas fa-trophy"></i> Leaderboard
          </button>
          <button className="text-gray-600 hover:text-primary flex items-center justify-center gap-2 transition-colors">
            <i className="fas fa-cog"></i> Settings
          </button>
          <button className="text-gray-600 hover:text-primary flex items-center justify-center gap-2 transition-colors">
            <i className="fas fa-info-circle"></i> How to Play
          </button>
        </div>
      </div>
    </motion.div>
  );
}

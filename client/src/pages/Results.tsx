import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { Question, UserAnswer } from "@/lib/types";

interface ResultsState {
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  userAnswers: UserAnswer[];
  questions: Question[];
}

export default function Results() {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [location, setLocation] = useLocation();
  const { playSound } = useSoundEffect();
  
  // Default values in case state is missing
  const [resultsState, setResultsState] = useState<ResultsState>({
    score: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    userAnswers: [],
    questions: []
  });
  
  useEffect(() => {
    // Try to get results from sessionStorage (stored by Quiz component)
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      setResultsState(JSON.parse(storedResults) as ResultsState);
      playSound("success");
    } else {
      // If no results found, redirect to home
      setLocation("/");
    }
  }, [playSound, setLocation]);
  
  const calculateAccuracy = (): string => {
    const total = resultsState.correctAnswers + resultsState.incorrectAnswers;
    if (total === 0) return "0%";
    return `${Math.round((resultsState.correctAnswers / total) * 100)}%`;
  };
  
  const handlePlayAgain = () => {
    playSound("click");
    setLocation("/categories");
  };
  
  const handleShareResults = () => {
    playSound("click");
    
    // Create share text
    const shareText = `I scored ${resultsState.score} points on Trivia Quest with ${resultsState.correctAnswers} correct answers (${calculateAccuracy()} accuracy)! Can you beat my score?`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'My Trivia Quest Score',
        text: shareText,
        url: window.location.origin,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText)
        .then(() => alert("Result copied to clipboard!"))
        .catch(() => alert("Failed to copy result."));
    }
  };
  
  const handleBackToHome = () => {
    playSound("click");
    setLocation("/");
  };
  
  const handleToggleReview = () => {
    setShowAllQuestions(!showAllQuestions);
  };
  
  const questionsToShow = showAllQuestions 
    ? resultsState.userAnswers
    : resultsState.userAnswers.slice(0, 3);
  
  return (
    <motion.div 
      className="min-h-screen py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="game-card p-8 mb-10 bg-white rounded-xl shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-center text-primary mb-6">Quiz Complete!</h2>
          
          <div className="mb-10 text-center">
            <motion.div 
              className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.5,
                type: "spring",
                stiffness: 200
              }}
            >
              <span className="text-4xl font-bold text-primary">{resultsState.score}</span>
            </motion.div>
            <p className="text-gray-600 text-xl">Your Score</p>
          </div>
          
          {/* Performance Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <motion.div 
              className="bg-green-50 p-4 rounded-lg"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-green-600 mb-1">{resultsState.correctAnswers}</div>
              <p className="text-gray-600 text-sm">Correct</p>
            </motion.div>
            
            <motion.div 
              className="bg-red-50 p-4 rounded-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-red-600 mb-1">{resultsState.incorrectAnswers}</div>
              <p className="text-gray-600 text-sm">Incorrect</p>
            </motion.div>
            
            <motion.div 
              className="bg-purple-50 p-4 rounded-lg"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-3xl font-bold text-purple-600 mb-1">{calculateAccuracy()}</div>
              <p className="text-gray-600 text-sm">Accuracy</p>
            </motion.div>
          </div>
          
          {/* Achievement */}
          <motion.div 
            className="mb-8 p-6 bg-secondary/10 rounded-lg text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-medal text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">New Achievement!</h3>
            <p className="text-gray-600">Knowledge Explorer: Complete a quiz with {resultsState.correctAnswers} correct answers</p>
          </motion.div>
          
          {/* Comparison to Average */}
          <motion.div 
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-center text-gray-600 mb-4">You scored better than 65% of players in this category</p>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ delay: 0.8, duration: 1 }}
              />
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button 
              className="bg-primary hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-full transition-all"
              onClick={handlePlayAgain}
            >
              <i className="fas fa-redo mr-2"></i> Play Again
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white text-primary border-2 border-primary hover:bg-primary/5 font-semibold py-3 px-6 rounded-full transition-all"
              onClick={handleShareResults}
            >
              <i className="fas fa-share-alt mr-2"></i> Share Results
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-100 font-semibold py-3 px-6 rounded-full transition-all"
              onClick={handleBackToHome}
            >
              <i className="fas fa-home mr-2"></i> Home
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Answer Review */}
        <motion.div 
          className="game-card p-6 bg-white rounded-xl shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-primary">Question Review</h3>
          
          {questionsToShow.map((answer, index) => {
            const question = resultsState.questions[answer.questionIndex];
            if (!question) return null;
            
            return (
              <div key={index} className="mb-4 p-4 border-b border-gray-200">
                <p className="font-medium mb-2" dangerouslySetInnerHTML={{ __html: question.question }} />
                <div className={`flex items-center ${answer.isCorrect ? 'text-success' : 'text-error'}`}>
                  <i className={`${answer.isCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'} mr-2`}></i>
                  <p>
                    Your answer: {" "}
                    <span className="font-semibold">
                      {answer.answer === "skipped" ? "Skipped" : answer.answer && answer.answer !== null 
                        ? (
                          <span dangerouslySetInnerHTML={{ __html: answer.answer }} />
                        ) 
                        : "Time expired"
                      }
                    </span>
                    {answer.isCorrect && " (Correct)"}
                  </p>
                </div>
                {!answer.isCorrect && (
                  <p className="text-gray-600 ml-6">
                    Correct answer: <span className="font-semibold" dangerouslySetInnerHTML={{ __html: answer.correctAnswer }} />
                  </p>
                )}
              </div>
            );
          })}
          
          {resultsState.userAnswers.length > 3 && (
            <div className="text-center mt-6">
              <Button 
                variant="link"
                className="text-primary hover:text-purple-800 font-medium transition-all"
                onClick={handleToggleReview}
              >
                {showAllQuestions ? 'Show Fewer Questions' : 'Show All Questions'}{' '}
                <i className={`fas fa-chevron-${showAllQuestions ? 'up' : 'down'} ml-1`}></i>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

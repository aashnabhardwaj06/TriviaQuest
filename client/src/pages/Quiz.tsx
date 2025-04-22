import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CircularProgressbar } from "react-circular-progressbar";
import { Spinner } from "@/components/ui/spinner";
import OptionButton from "@/components/OptionButton";
import FeedbackModal from "@/components/FeedbackModal";
import PowerupButton from "@/components/PowerupButton";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { Question, QuizState } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Quiz() {
  const { categoryId, categoryName, difficulty } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { playSound } = useSoundEffect();
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    userAnswers: [],
    timeLeft: 100,
    isAnswerSelected: false,
    showFeedback: false,
    feedbackType: null,
    selectedOptionId: null,
    powerUps: {
      fiftyFifty: true,
      hint: true,
      skip: true
    },
    removedOptions: []
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const decodedCategoryName = decodeURIComponent(categoryName || "");
  
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['/api/trivia/questions', categoryId, difficulty],
  });
  
  useEffect(() => {
    if (questions) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [questions, quizState.currentQuestionIndex]);
  
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setQuizState(prev => ({ ...prev, timeLeft: 100 }));
    
    const timerDuration = difficulty === 'hard' ? 15000 : difficulty === 'medium' ? 20000 : 30000;
    const interval = timerDuration / 100;
    
    timerRef.current = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          
          if (!prev.isAnswerSelected) {
            setTimeout(() => {
              setQuizState(prev => ({
                ...prev,
                showFeedback: true,
                feedbackType: 'timeout',
                incorrectAnswers: prev.incorrectAnswers + 1,
                userAnswers: [
                  ...prev.userAnswers, 
                  { 
                    questionIndex: prev.currentQuestionIndex,
                    isCorrect: false,
                    answer: null,
                    correctAnswer: getCurrentQuestion()?.correct_answer || ""
                  }
                ]
              }));
            }, 500);
          }
          
          return prev;
        }
        
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, interval);
  };
  
  const getCurrentQuestion = (): Question | undefined => {
    if (!questions || questions.length === 0) return undefined;
    if (quizState.currentQuestionIndex >= questions.length) return undefined;
    return questions[quizState.currentQuestionIndex];
  };
  
  const handleAnswerSelection = (optionId: string, isCorrect: boolean) => {
    if (quizState.isAnswerSelected) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    playSound(isCorrect ? "correct" : "wrong");
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setQuizState(prev => ({
      ...prev,
      isAnswerSelected: true,
      selectedOptionId: optionId
    }));
    
    setTimeout(() => {
      setQuizState(prev => ({
        ...prev,
        showFeedback: true,
        feedbackType: isCorrect ? 'correct' : 'incorrect',
        score: isCorrect ? prev.score + calculateScore() : prev.score,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        incorrectAnswers: !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
        userAnswers: [
          ...prev.userAnswers, 
          { 
            questionIndex: prev.currentQuestionIndex,
            isCorrect,
            answer: optionId,
            correctAnswer: currentQuestion.correct_answer
          }
        ]
      }));
    }, 1000);
  };
  
  const handleNextQuestion = () => {
    const nextQuestionIndex = quizState.currentQuestionIndex + 1;
    
    if (!questions || nextQuestionIndex >= questions.length) {
      // End of quiz - navigate to results
      // Store the results in sessionStorage to access in results page
      sessionStorage.setItem('quizResults', JSON.stringify({ 
        score: quizState.score,
        correctAnswers: quizState.correctAnswers,
        incorrectAnswers: quizState.incorrectAnswers,
        userAnswers: quizState.userAnswers,
        questions
      }));
      setLocation('/results');
      return;
    }
    
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: nextQuestionIndex,
      showFeedback: false,
      feedbackType: null,
      isAnswerSelected: false,
      selectedOptionId: null,
      removedOptions: []
    }));
  };
  
  const calculateScore = () => {
    // Base points
    let points = 100;
    
    // Difficulty bonus
    if (difficulty === 'medium') points = 150;
    if (difficulty === 'hard') points = 200;
    
    // Time bonus (up to 50% extra for fast answers)
    const timeBonus = Math.floor((quizState.timeLeft / 100) * (points * 0.5));
    
    return points + timeBonus;
  };
  
  const handleFiftyFifty = () => {
    if (!quizState.powerUps.fiftyFifty || quizState.isAnswerSelected) return;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    playSound("powerup");
    
    // Get all incorrect options
    const incorrectOptions = currentQuestion.all_options.filter(
      option => option !== currentQuestion.correct_answer
    );
    
    // Randomly remove 2 incorrect options (or 1 if there's only one incorrect option)
    const numToRemove = Math.min(incorrectOptions.length, 2);
    const shuffled = [...incorrectOptions].sort(() => 0.5 - Math.random());
    const optionsToRemove = shuffled.slice(0, numToRemove);
    
    setQuizState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        fiftyFifty: false
      },
      removedOptions: optionsToRemove
    }));
    
    toast({
      title: "50/50 Power-up Used",
      description: "Two incorrect answers have been removed.",
      variant: "default"
    });
  };
  
  const handleHint = () => {
    if (!quizState.powerUps.hint || quizState.isAnswerSelected) return;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    playSound("powerup");
    
    // Generate a hint
    let hint = "Look for the most logical answer.";
    
    // More specific hints could be generated based on question type
    if (currentQuestion.category.includes("Science")) {
      hint = "Think about scientific principles and facts.";
    } else if (currentQuestion.category.includes("History")) {
      hint = "Consider the historical timeline and significant events.";
    } else if (currentQuestion.category.includes("Geography")) {
      hint = "Think about locations, capitals, and geographical features.";
    }
    
    setQuizState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        hint: false
      }
    }));
    
    toast({
      title: "Hint Used",
      description: hint,
      variant: "default"
    });
  };
  
  const handleSkip = () => {
    if (!quizState.powerUps.skip || quizState.isAnswerSelected) return;
    
    playSound("powerup");
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setQuizState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        skip: false
      },
      userAnswers: [
        ...prev.userAnswers, 
        { 
          questionIndex: prev.currentQuestionIndex,
          isCorrect: false,
          answer: "skipped",
          correctAnswer: currentQuestion.correct_answer
        }
      ]
    }));
    
    toast({
      title: "Question Skipped",
      description: "Moving to the next question.",
      variant: "default"
    });
    
    // Move to next question
    setTimeout(handleNextQuestion, 1000);
  };
  
  const currentQuestion = getCurrentQuestion();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-primary font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }
  
  if (error || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error mb-4">Failed to load questions</h2>
          <p className="text-gray-600 mb-6">There was an error loading the trivia questions. Please try again.</p>
          <button 
            className="bg-primary text-white px-6 py-2 rounded-full font-medium"
            onClick={() => setLocation("/categories")}
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Quiz Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="relative w-16 h-16">
              <CircularProgressbar
                value={(quizState.currentQuestionIndex + 1) / questions.length * 100}
                strokeWidth={10}
                styles={{
                  path: {
                    stroke: '#6D28D9',
                    strokeLinecap: 'round',
                  },
                  trail: {
                    stroke: '#E5E7EB',
                  },
                }}
              />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {quizState.currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold text-primary">{decodedCategoryName}</p>
            </div>
          </div>
          <div>
            <div className="bg-primary/10 px-4 py-2 rounded-full">
              <span className="font-bold text-xl text-primary">{quizState.score}</span>
              <span className="text-gray-500 text-sm">pts</span>
            </div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-secondary"
              initial={{ width: "100%" }}
              animate={{ width: `${quizState.timeLeft}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>
        
        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={quizState.currentQuestionIndex}
            className="game-card p-6 md:p-8 mb-6 bg-white rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestion && (
              <>
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-6 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
                
                {/* Answer Options */}
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.all_options.map((option, index) => (
                    <OptionButton
                      key={option}
                      option={option}
                      index={index}
                      isSelected={quizState.selectedOptionId === option}
                      isCorrect={quizState.showFeedback && option === currentQuestion.correct_answer}
                      isIncorrect={quizState.showFeedback && quizState.selectedOptionId === option && option !== currentQuestion.correct_answer}
                      isDisabled={quizState.isAnswerSelected || quizState.removedOptions.includes(option)}
                      onClick={() => handleAnswerSelection(option, option === currentQuestion.correct_answer)}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Power-ups and Hints */}
        <div className="flex justify-center space-x-6 mb-6">
          <PowerupButton
            icon="fas fa-balance-scale"
            title="50/50: Remove two incorrect answers"
            isActive={quizState.powerUps.fiftyFifty}
            onClick={handleFiftyFifty}
          />
          <PowerupButton
            icon="fas fa-lightbulb"
            title="Hint: Get a clue about the correct answer"
            isActive={quizState.powerUps.hint}
            onClick={handleHint}
          />
          <PowerupButton
            icon="fas fa-forward"
            title="Skip: Move to next question"
            isActive={quizState.powerUps.skip}
            onClick={handleSkip}
          />
        </div>
        
        {/* Feedback Modal */}
        <FeedbackModal
          show={quizState.showFeedback}
          type={quizState.feedbackType}
          score={calculateScore()}
          correctAnswer={currentQuestion?.correct_answer || ""}
          onContinue={handleNextQuestion}
        />
      </div>
    </div>
  );
}

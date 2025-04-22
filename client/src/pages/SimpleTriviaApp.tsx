import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { fetchCategories, fetchQuestions, saveGameStats } from "@/lib/triviaService";
import { Category, Question, UserAnswer, QuizState } from "@/lib/types";
import { shuffle } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FaCheckCircle, FaTimesCircle, FaChevronRight, FaCog } from "react-icons/fa";

const QUESTION_TIMER = 15; // seconds per question

export default function SimpleTriviaApp() {
  const { playSound } = useSoundEffect();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    userAnswers: [],
    timeLeft: QUESTION_TIMER,
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

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/trivia/categories'],
    queryFn: fetchCategories
  });

  // Fetch questions when category and difficulty are selected
  const fetchQuestionsForQuiz = async () => {
    if (selectedCategory && selectedDifficulty) {
      try {
        const questionsData = await fetchQuestions(
          selectedCategory.id.toString(), 
          selectedDifficulty
        );
        setQuestions(questionsData);
        setIsQuizActive(true);
        setQuizState({
          ...quizState,
          currentQuestionIndex: 0,
          score: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          userAnswers: [],
          timeLeft: QUESTION_TIMER,
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
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }
  };

  // Main timer for questions
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (isQuizActive && !quizState.isAnswerSelected && !quizState.showFeedback && quizState.timeLeft > 0) {
      timerId = setTimeout(() => {
        setQuizState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (quizState.timeLeft === 0 && !quizState.showFeedback) {
      // Time's up
      handleTimeout();
    }
    
    return () => clearTimeout(timerId);
  }, [isQuizActive, quizState.timeLeft, quizState.isAnswerSelected, quizState.showFeedback]);

  // Handle time out
  const handleTimeout = () => {
    const currentQuestion = questions[quizState.currentQuestionIndex];
    playSound("wrong");
    
    // Record the answer
    const newUserAnswers = [...quizState.userAnswers];
    newUserAnswers.push({
      questionIndex: quizState.currentQuestionIndex,
      isCorrect: false,
      answer: null,
      correctAnswer: currentQuestion.correct_answer
    });
    
    setQuizState(prev => ({
      ...prev,
      incorrectAnswers: prev.incorrectAnswers + 1,
      userAnswers: newUserAnswers,
      isAnswerSelected: true,
      showFeedback: true,
      feedbackType: "timeout"
    }));
  };

  // Handle selecting an answer
  const handleSelectOption = (option: string) => {
    if (quizState.isAnswerSelected || quizState.showFeedback) return;
    
    const currentQuestion = questions[quizState.currentQuestionIndex];
    const isCorrect = option === currentQuestion.correct_answer;
    
    playSound(isCorrect ? "correct" : "wrong");
    
    // Calculate points (more points for faster answers)
    const timeBonus = Math.floor((quizState.timeLeft / QUESTION_TIMER) * 50);
    const difficultyMultiplier = selectedDifficulty === 'easy' ? 1 : selectedDifficulty === 'medium' ? 1.5 : 2;
    const points = isCorrect ? Math.floor((100 + timeBonus) * difficultyMultiplier) : 0;
    
    // Record the answer
    const newUserAnswers = [...quizState.userAnswers];
    newUserAnswers.push({
      questionIndex: quizState.currentQuestionIndex,
      isCorrect,
      answer: option,
      correctAnswer: currentQuestion.correct_answer
    });
    
    setQuizState(prev => ({
      ...prev,
      score: prev.score + points,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
      userAnswers: newUserAnswers,
      isAnswerSelected: true,
      showFeedback: true,
      feedbackType: isCorrect ? "correct" : "incorrect",
      selectedOptionId: option
    }));
  };

  // Continue to next question
  const handleContinue = () => {
    if (quizState.currentQuestionIndex >= questions.length - 1) {
      // Quiz complete - show results
      setShowResults(true);
      setIsQuizActive(false);
      
      // Store results in session storage (for persistence)
      const resultsData = {
        score: quizState.score,
        correctAnswers: quizState.correctAnswers,
        incorrectAnswers: quizState.incorrectAnswers,
        userAnswers: quizState.userAnswers,
        questions
      };
      sessionStorage.setItem('quizResults', JSON.stringify(resultsData));
      
      // Save game stats to API
      saveGameStats({
        userId: "user123", // In a real app, this would be the actual user ID
        username: "Player", // In a real app, this would be the actual username
        score: quizState.score,
        categoryId: selectedCategory?.id || 0,
        difficulty: selectedDifficulty || "easy",
        correctAnswers: quizState.correctAnswers,
        incorrectAnswers: quizState.incorrectAnswers,
        datePlayed: new Date().toISOString()
      }).catch(err => console.error("Error saving game stats:", err));
      
    } else {
      // Move to next question
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timeLeft: QUESTION_TIMER,
        isAnswerSelected: false,
        showFeedback: false,
        feedbackType: null,
        selectedOptionId: null,
        removedOptions: []
      }));
    }
  };

  // Handle 50:50 power-up
  const handleFiftyFifty = () => {
    if (!quizState.powerUps.fiftyFifty || quizState.isAnswerSelected || quizState.removedOptions.length > 0) return;
    
    playSound("powerup");
    const currentQuestion = questions[quizState.currentQuestionIndex];
    const correctOption = currentQuestion.correct_answer;
    
    // Get incorrect options
    const incorrectOptions = currentQuestion.all_options.filter(option => option !== correctOption);
    
    // Randomly remove half of the incorrect options
    const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
    const toRemove = shuffled.slice(0, Math.floor(incorrectOptions.length / 2));
    
    setQuizState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        fiftyFifty: false
      },
      removedOptions: toRemove
    }));
  };

  // Handle hint power-up
  const handleHint = () => {
    if (!quizState.powerUps.hint || quizState.isAnswerSelected) return;
    
    playSound("powerup");
    
    // Simple hint - reduce time penalty in exchange for highlighting (not directly showing) the correct answer
    setQuizState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        hint: false
      },
      // In a real implementation, you might set a "hintActive" flag to visually highlight the correct answer
      // For simplicity, we'll just reduce the score penalty for this question
      timeLeft: Math.min(prev.timeLeft + 5, QUESTION_TIMER) // Add 5 seconds back as a "hint"
    }));
  };

  // Handle skip power-up
  const handleSkip = () => {
    if (!quizState.powerUps.skip || quizState.isAnswerSelected) return;
    
    playSound("powerup");
    
    // Record this as a skipped question
    const currentQuestion = questions[quizState.currentQuestionIndex];
    const newUserAnswers = [...quizState.userAnswers];
    newUserAnswers.push({
      questionIndex: quizState.currentQuestionIndex,
      isCorrect: false,
      answer: "skipped",
      correctAnswer: currentQuestion.correct_answer
    });
    
    setQuizState(prev => ({
      ...prev,
      userAnswers: newUserAnswers,
      powerUps: {
        ...prev.powerUps,
        skip: false
      }
    }));
    
    // Move to next question
    if (quizState.currentQuestionIndex >= questions.length - 1) {
      setShowResults(true);
      setIsQuizActive(false);
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timeLeft: QUESTION_TIMER,
        isAnswerSelected: false,
        showFeedback: false,
        feedbackType: null,
        selectedOptionId: null,
        removedOptions: []
      }));
    }
  };

  // Category selection component
  const CategorySelection = () => (
    <div className="category-selection p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Select a Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories && categories.map((category: Category) => (
          <div 
            key={category.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-105 hover:shadow-md
              ${selectedCategory?.id === category.id 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-200 bg-white hover:border-primary/40'}`}
            onClick={() => {
              setSelectedCategory(category);
              playSound("click");
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl mb-2" role="img" aria-label={category.name}>
                {category.icon}
              </span>
              <h3 className="font-medium text-center">{category.name}</h3>
              <div className="mt-2 flex gap-1 flex-wrap justify-center">
                {category.tags.slice(0, 2).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Difficulty selection component
  const DifficultySelection = () => {
    if (!selectedCategory) return null;
    
    return (
      <div className="difficulty-selection p-4 mt-4">
        <h2 className="text-xl font-bold mb-4 text-center">Select Difficulty</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Easy Difficulty */}
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedDifficulty === 'easy' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-white hover:border-green-300'}`}
            onClick={() => {
              setSelectedDifficulty('easy');
              playSound("click");
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2 text-green-500">🙂</span>
              <h3 className="font-medium text-green-700">Easy</h3>
              <p className="text-xs text-gray-600 text-center mt-1">
                Perfect for beginners
              </p>
            </div>
          </div>
          
          {/* Medium Difficulty */}
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedDifficulty === 'medium' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 bg-white hover:border-yellow-300'}`}
            onClick={() => {
              setSelectedDifficulty('medium');
              playSound("click");
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2 text-yellow-500">😐</span>
              <h3 className="font-medium text-yellow-700">Medium</h3>
              <p className="text-xs text-gray-600 text-center mt-1">
                For those seeking a challenge
              </p>
            </div>
          </div>
          
          {/* Hard Difficulty */}
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedDifficulty === 'hard' 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-red-300'}`}
            onClick={() => {
              setSelectedDifficulty('hard');
              playSound("click");
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2 text-red-500">😬</span>
              <h3 className="font-medium text-red-700">Hard</h3>
              <p className="text-xs text-gray-600 text-center mt-1">
                For trivia experts only
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Start Quiz Button
  const StartButton = () => {
    if (!selectedCategory || !selectedDifficulty) return null;
    
    return (
      <div className="text-center mt-6 mb-4">
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-full flex items-center" 
          onClick={() => {
            playSound("click");
            fetchQuestionsForQuiz();
          }}
        >
          Start Quiz <FaChevronRight className="ml-2" />
        </Button>
      </div>
    );
  };

  // Render the quiz component
  const Quiz = () => {
    if (!isQuizActive || questions.length === 0) return null;
    
    const currentQuestion = questions[quizState.currentQuestionIndex];
    
    return (
      <div className="quiz-container p-4">
        {/* Quiz Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1">
            {/* Power-ups */}
            <Button 
              variant="outline" 
              size="sm" 
              className={`rounded-full ${!quizState.powerUps.fiftyFifty ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
              onClick={handleFiftyFifty}
              disabled={!quizState.powerUps.fiftyFifty || quizState.isAnswerSelected}
            >
              50:50
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`rounded-full ${!quizState.powerUps.hint ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
              onClick={handleHint}
              disabled={!quizState.powerUps.hint || quizState.isAnswerSelected}
            >
              +5s
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`rounded-full ${!quizState.powerUps.skip ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
              onClick={handleSkip}
              disabled={!quizState.powerUps.skip || quizState.isAnswerSelected}
            >
              Skip
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">Score: {quizState.score}</span>
            <div className={`ml-2 px-3 py-1 rounded-full text-white font-medium ${quizState.timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}>
              {quizState.timeLeft}s
            </div>
          </div>
        </div>
        
        {/* Quiz Progress */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{width: `${((quizState.currentQuestionIndex) / questions.length) * 100}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-600 mt-1 text-right">
            Question {quizState.currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        {/* Question */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <p className="text-lg font-medium" dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></p>
        </div>
        
        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.all_options.map((option, index) => {
            const isSelected = quizState.selectedOptionId === option;
            const isCorrectAnswer = currentQuestion.correct_answer === option;
            const showCorrect = quizState.showFeedback && isCorrectAnswer;
            const showIncorrect = quizState.showFeedback && isSelected && !isCorrectAnswer;
            const isRemoved = quizState.removedOptions.includes(option);
            
            if (isRemoved) return null;
            
            return (
              <motion.button
                key={index}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  showCorrect
                    ? 'bg-green-50 border-green-500 text-green-800'
                    : showIncorrect
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : isSelected
                    ? 'bg-primary/20 border-primary'
                    : 'bg-white border-gray-200 hover:border-primary/50'
                } ${quizState.isAnswerSelected && !showCorrect && !showIncorrect ? 'opacity-70' : ''}`}
                onClick={() => handleSelectOption(option)}
                disabled={quizState.isAnswerSelected || quizState.showFeedback}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex items-center">
                  <span className="mr-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-primary font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: option }}></span>
                  {showCorrect && <FaCheckCircle className="ml-auto text-green-600" />}
                  {showIncorrect && <FaTimesCircle className="ml-auto text-red-600" />}
                </div>
              </motion.button>
            );
          })}
        </div>
        
        {/* Feedback and Continue Button */}
        {quizState.showFeedback && (
          <div className="mt-6 text-center">
            <div className={`mb-4 p-3 rounded-md ${
              quizState.feedbackType === 'correct'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              {quizState.feedbackType === 'correct' && (
                <p className="font-medium">Correct! +{quizState.score - (quizState.userAnswers.length > 1 ? quizState.userAnswers.slice(0, -1).reduce((acc, curr) => curr.isCorrect ? acc + 1 : acc, 0) * 100 : 0)} points</p>
              )}
              {quizState.feedbackType === 'incorrect' && (
                <p className="font-medium">
                  Incorrect. The correct answer is: <span dangerouslySetInnerHTML={{ __html: currentQuestion.correct_answer }}></span>
                </p>
              )}
              {quizState.feedbackType === 'timeout' && (
                <p className="font-medium">
                  Time's up! The correct answer is: <span dangerouslySetInnerHTML={{ __html: currentQuestion.correct_answer }}></span>
                </p>
              )}
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-full"
              onClick={handleContinue}
            >
              {quizState.currentQuestionIndex >= questions.length - 1 ? 'See Results' : 'Next Question'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Results component
  const Results = () => {
    if (!showResults) return null;
    
    const [showAllQuestions, setShowAllQuestions] = useState(false);
    
    const calculateAccuracy = (): string => {
      const total = quizState.correctAnswers + quizState.incorrectAnswers;
      if (total === 0) return "0%";
      return `${Math.round((quizState.correctAnswers / total) * 100)}%`;
    };
    
    const questionsToShow = showAllQuestions 
      ? quizState.userAnswers
      : quizState.userAnswers.slice(0, 3);
    
    return (
      <div className="results p-4">
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-2xl font-bold text-center text-primary mb-4">Quiz Complete!</h2>
          
          <div className="mb-6 text-center">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-primary">{quizState.score}</span>
            </div>
            <p className="text-gray-600">Your Score</p>
          </div>
          
          {/* Performance Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{quizState.correctAnswers}</div>
              <p className="text-gray-600 text-xs">Correct</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{quizState.incorrectAnswers}</div>
              <p className="text-gray-600 text-xs">Incorrect</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{calculateAccuracy()}</div>
              <p className="text-gray-600 text-xs">Accuracy</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-full"
              onClick={() => {
                playSound("click");
                setSelectedCategory(null);
                setSelectedDifficulty(null);
                setIsQuizActive(false);
                setShowResults(false);
              }}
            >
              New Category
            </Button>
            
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 font-semibold py-2 px-4 rounded-full"
              onClick={() => {
                playSound("click");
                setIsQuizActive(false);
                setShowResults(false);
                fetchQuestionsForQuiz(); // Restart with same settings
              }}
            >
              Play Again
            </Button>
          </div>
        </div>
        
        {/* Answer Review */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-primary mb-3">Question Review</h3>
          
          {questionsToShow.map((answer, index) => {
            const question = questions[answer.questionIndex];
            if (!question) return null;
            
            return (
              <div key={index} className="mb-3 p-3 border-b border-gray-100">
                <p className="font-medium text-sm mb-1" dangerouslySetInnerHTML={{ __html: question.question }} />
                <div className={`flex items-center text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {answer.isCorrect ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                  <p>
                    Your answer: {" "}
                    <span className="font-medium">
                      {answer.answer === "skipped" ? "Skipped" : answer.answer && answer.answer !== null 
                        ? (
                          <span dangerouslySetInnerHTML={{ __html: answer.answer }} />
                        ) 
                        : "Time expired"
                      }
                    </span>
                  </p>
                </div>
                {!answer.isCorrect && (
                  <p className="text-gray-600 text-sm mt-1 ml-5">
                    Correct answer: <span className="font-medium" dangerouslySetInnerHTML={{ __html: answer.correctAnswer }} />
                  </p>
                )}
              </div>
            );
          })}
          
          {quizState.userAnswers.length > 3 && (
            <Button 
              variant="link"
              className="text-primary text-sm"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
            >
              {showAllQuestions ? 'Show Fewer Questions' : 'Show All Questions'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="simple-trivia-app">
      {isCategoriesLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div>
          {/* Show quiz content when active */}
          {isQuizActive ? (
            <Quiz />
          ) : showResults ? (
            <Results />
          ) : (
            /* Show category/difficulty selection when not in quiz */
            <div>
              <CategorySelection />
              {selectedCategory && <DifficultySelection />}
              <StartButton />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FeedbackModalProps {
  show: boolean;
  type: "correct" | "incorrect" | "timeout" | null;
  score: number;
  correctAnswer: string;
  onContinue: () => void;
}

export default function FeedbackModal({ 
  show, 
  type, 
  score, 
  correctAnswer, 
  onContinue 
}: FeedbackModalProps) {
  
  // Early return if not shown
  if (!show || !type) return null;
  
  const isCorrect = type === "correct";
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-xl p-8 max-w-md shadow-2xl text-center mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className={`w-24 h-24 ${isCorrect ? 'bg-success/20' : 'bg-error/20'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <i className={`fas ${isCorrect ? 'fa-check' : 'fa-times'} text-4xl ${isCorrect ? 'text-success' : 'text-error'}`}></i>
            </div>
            
            <h3 className={`text-2xl font-bold ${isCorrect ? 'text-success' : 'text-error'} mb-2`}>
              {isCorrect ? 'Correct!' : type === "timeout" ? 'Time\'s Up!' : 'Incorrect'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {isCorrect 
                ? "That's the right answer! Well done." 
                : type === "timeout"
                  ? "You ran out of time."
                  : "That's not the right answer."
              }
            </p>
            
            {!isCorrect && (
              <>
                <p className="text-gray-600 mb-2">The correct answer was:</p>
                <p 
                  className="font-semibold text-gray-800 mb-4"
                  dangerouslySetInnerHTML={{ __html: correctAnswer }}
                />
              </>
            )}
            
            <div className="mb-6 text-center">
              {isCorrect ? (
                <>
                  <span className="text-2xl font-bold text-primary">+{score}</span>
                  <span className="text-gray-500"> points</span>
                </>
              ) : (
                <span className="text-error font-semibold">No points awarded</span>
              )}
            </div>
            
            <Button 
              className="bg-primary hover:bg-purple-800 text-white font-semibold py-3 px-8 rounded-full transition-all w-full"
              onClick={onContinue}
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

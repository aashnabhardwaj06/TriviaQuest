import { motion } from "framer-motion";

interface OptionButtonProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export default function OptionButton({
  option,
  index,
  isSelected,
  isCorrect,
  isIncorrect,
  isDisabled,
  onClick
}: OptionButtonProps) {
  
  const getLetterIndex = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  };
  
  const getButtonClass = () => {
    if (isCorrect) return 'bg-success/20 border-success text-success correct-animation';
    if (isIncorrect) return 'bg-error/20 border-error text-error incorrect-animation';
    if (isSelected) return 'bg-primary/20 border-primary';
    if (isDisabled) return 'opacity-50 cursor-not-allowed';
    return 'border-gray-200 hover:bg-purple-50 hover:border-primary';
  };
  
  return (
    <motion.button 
      className={`option-button text-left p-4 border-2 rounded-lg transition-all ${getButtonClass()}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDisabled ? 0.5 : 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
    >
      <div className="flex items-center">
        <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary font-semibold rounded-full flex items-center justify-center">
          {getLetterIndex(index)}
        </span>
        <span 
          className="ml-3 text-gray-700"
          dangerouslySetInnerHTML={{ __html: option }}
        />
      </div>
    </motion.button>
  );
}

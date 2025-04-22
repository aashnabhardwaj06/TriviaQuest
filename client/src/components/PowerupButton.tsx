import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PowerupButtonProps {
  icon: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

export default function PowerupButton({ 
  icon, 
  title, 
  isActive, 
  onClick 
}: PowerupButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button 
            className={`rounded-full w-12 h-12 flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={isActive ? { scale: 1.1 } : {}}
            whileTap={isActive ? { scale: 0.95 } : {}}
            onClick={isActive ? onClick : undefined}
          >
            <i className={icon}></i>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
          {!isActive && <p className="text-xs text-gray-500">Already used</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

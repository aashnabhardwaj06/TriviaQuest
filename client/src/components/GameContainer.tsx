import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GameContainerProps {
  children: ReactNode;
}

export default function GameContainer({ children }: GameContainerProps) {
  return (
    <motion.div
      className="game-container bg-gradient-to-b from-purple-50 to-purple-100 min-h-screen w-full overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

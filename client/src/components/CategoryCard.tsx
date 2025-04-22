import { motion } from "framer-motion";
import { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const { id, name, icon, color, questionCount, tags } = category;
  
  const getBgColor = () => {
    switch (color) {
      case 'primary': return 'bg-primary/10';
      case 'secondary': return 'bg-secondary/10';
      case 'accent': return 'bg-accent/10';
      case 'pink': return 'bg-pink-100';
      case 'blue': return 'bg-blue-100';
      case 'orange': return 'bg-orange-100';
      default: return 'bg-primary/10';
    }
  };
  
  const getTextColor = () => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'secondary': return 'text-secondary';
      case 'accent': return 'text-accent';
      case 'pink': return 'text-pink-500';
      case 'blue': return 'text-blue-500';
      case 'orange': return 'text-orange-500';
      default: return 'text-primary';
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };
  
  return (
    <motion.div
      className="category-card game-card p-6 cursor-pointer bg-white rounded-xl shadow-lg"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onClick}
    >
      <div className={`${getBgColor()} rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto`}>
        <i className={`${icon} text-3xl ${getTextColor()}`}></i>
      </div>
      <h3 className="text-xl font-semibold text-center">{name}</h3>
      <p className="text-gray-500 text-center text-sm mt-2">{category.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-400">Questions: {questionCount}+</span>
        <span className={`text-xs ${tags[0] === 'Popular' ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-600'} px-2 py-1 rounded-full`}>
          {tags[0]}
        </span>
      </div>
    </motion.div>
  );
}

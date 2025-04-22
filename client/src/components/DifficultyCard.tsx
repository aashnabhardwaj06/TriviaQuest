import { motion } from "framer-motion";

interface DifficultyCardProps {
  difficulty: "easy" | "medium" | "hard";
  isSelected: boolean;
  onClick: () => void;
  icon: string;
  color: "green" | "yellow" | "red";
  title: string;
  description: string;
  features: string[];
  badge: string;
}

export default function DifficultyCard({
  difficulty,
  isSelected,
  onClick,
  icon,
  color,
  title,
  description,
  features,
  badge
}: DifficultyCardProps) {
  
  const getBgColor = () => {
    switch (color) {
      case 'green': return 'bg-green-100';
      case 'yellow': return 'bg-yellow-100';
      case 'red': return 'bg-red-100';
      default: return 'bg-green-100';
    }
  };
  
  const getTextColor = () => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-yellow-500';
      case 'red': return 'text-red-500';
      default: return 'text-green-500';
    }
  };
  
  const getTitleColor = () => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-green-600';
    }
  };
  
  const getCheckColor = () => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-yellow-500';
      case 'red': return 'text-red-500';
      default: return 'text-green-500';
    }
  };
  
  const getBadgeColors = () => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-700';
      case 'yellow': return 'bg-yellow-100 text-yellow-700';
      case 'red': return 'bg-red-100 text-red-700';
      default: return 'bg-green-100 text-green-700';
    }
  };
  
  const getBorderColor = () => {
    if (!isSelected) return '';
    
    switch (color) {
      case 'green': return 'border-2 border-green-300 shadow-lg';
      case 'yellow': return 'border-2 border-yellow-300 shadow-lg';
      case 'red': return 'border-2 border-red-300 shadow-lg';
      default: return 'border-2 border-green-300 shadow-lg';
    }
  };
  
  return (
    <motion.div 
      className={`difficulty-card game-card p-6 cursor-pointer bg-white rounded-xl shadow-md ${getBorderColor()} transition-all`}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      onClick={onClick}
    >
      <div className="text-center mb-4">
        <div className={`inline-block p-3 ${getBgColor()} rounded-full`}>
          <i className={`${icon} text-4xl ${getTextColor()}`}></i>
        </div>
      </div>
      
      <h3 className={`text-2xl font-semibold text-center ${getTitleColor()} mb-2`}>{title}</h3>
      <p className="text-gray-500 text-center text-sm">{description}</p>
      
      <ul className="mt-4 text-sm text-gray-600">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center mb-2">
            <i className={`fas fa-check ${getCheckColor()} mr-2`}></i>
            {feature}
          </li>
        ))}
      </ul>
      
      <div className="mt-6 text-center">
        <span className={`inline-block ${getBadgeColors()} px-3 py-1 rounded-full text-sm`}>
          {badge}
        </span>
      </div>
    </motion.div>
  );
}

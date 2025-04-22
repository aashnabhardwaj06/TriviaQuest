import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import CategoryCard from "@/components/CategoryCard";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { Category } from "@/lib/types";

export default function CategorySelection() {
  const [, setLocation] = useLocation();
  const { playSound } = useSoundEffect();
  
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/trivia/categories'],
  });

  const handleCategorySelect = (category: Category) => {
    playSound("click");
    setLocation(`/difficulty/${category.id}/${encodeURIComponent(category.name)}`);
  };

  const handleBackToWelcome = () => {
    playSound("click");
    setLocation("/");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen py-12 px-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center text-primary mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Choose a Category
        </motion.h2>
        
        <motion.p 
          className="text-center text-gray-600 mb-10"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Select a category that interests you the most!
        </motion.p>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-error py-10">
            <p>Failed to load categories. Please try again.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10"
            variants={containerVariants}
          >
            {categories && categories.map((category: Category) => (
              <CategoryCard 
                key={category.id}
                category={category}
                onClick={() => handleCategorySelect(category)}
              />
            ))}
          </motion.div>
        )}
        
        <div className="text-center mt-6">
          <Button 
            variant="outline"
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all"
            onClick={handleBackToWelcome}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

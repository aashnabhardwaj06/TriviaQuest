import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CategorySelection from "@/pages/CategorySelection";
import DifficultySelection from "@/pages/DifficultySelection";
import Quiz from "@/pages/Quiz";
import Results from "@/pages/Results";
import GameContainer from "@/components/GameContainer";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/categories" component={CategorySelection} />
        <Route path="/difficulty/:categoryId/:categoryName" component={DifficultySelection} />
        <Route path="/quiz/:categoryId/:categoryName/:difficulty" component={Quiz} />
        <Route path="/results" component={Results} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameContainer>
          <Router />
        </GameContainer>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

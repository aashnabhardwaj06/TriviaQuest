import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleTriviaApp from "./pages/SimpleTriviaApp";
import GameContainer from "@/components/GameContainer";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameContainer>
          <SimpleTriviaApp />
        </GameContainer>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

# Trivia Challenge App

A gamified, interactive trivia application built with React and Express that uses the Open Trivia Database API.


## Features

- **Single-page application** with seamless transitions between categories, difficulties, and questions
- **Multiple categories** to choose from, covering various topics
- **Three difficulty levels**: Easy, Medium, and Hard
- **Timer-based gameplay** with countdown for each question adding pressure and excitement
- **Power-ups** to enhance gameplay:
  - 50:50 (removes half of the incorrect options)
  - Hint (adds extra time to the countdown timer)
  - Skip (skip a difficult question without penalty)
- **Sound effects** provide audio feedback for correct/incorrect answers and power-up usage
- **Real-time scoring** with points awarded based on difficulty and response time
- **Interactive feedback** with color-coded responses and animations
- **Progress tracking** with a progress bar showing quiz completion status
- **Detailed results screen** with performance statistics and answer review
- **Responsive design** that works on mobile, tablet, and desktop
- **Direct API integration** for both development and production
- **Local storage** for saving game statistics and leaderboards

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Motion animations for fluid transitions
  - Tailwind CSS and shadcn/ui for styling
  - React Query for data fetching
  - React Hook Form for form handling

- **Backend**:
  - Express.js server
  - In-memory storage for local development
  - Direct Open Trivia DB API integration for production

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser at `http://localhost:5000`

## Deployment

The application is configured for deployment on Vercel:

1. Create a new Vercel project linked to your repository
2. Deploy using the default settings
3. The application will automatically use the direct Open Trivia DB API in production

## How to Play

1. **Select a Category**: Choose from various trivia categories
2. **Choose Difficulty**: Select Easy, Medium, or Hard
3. **Answer Questions**: Read each question carefully and select the correct answer
4. **Use Power-ups**: When stuck, use your three power-ups (each available once per game)
5. **View Results**: After all questions, see your score and performance statistics

## Game Mechanics

### Countdown Timer
- Each question has a timer that counts down from 20 seconds
- The timer changes color to red when time is running low
- Points are awarded based on remaining time - faster answers earn more points
- If time runs out, the question is marked as incorrect and the game advances

### Scoring System
- Base points: 100 points per correct answer
- Time bonus: Additional points based on how quickly you answer
- Difficulty multipliers:
  - Easy: 1x points
  - Medium: 1.5x points
  - Hard: 2x points

### Power-ups
- **50:50**: Eliminates half of the incorrect answers, making it easier to choose the correct one
- **Hint (+5s)**: Adds 5 seconds to the countdown timer, giving you more time to think
- **Skip**: Allows you to skip the current question without penalty and move to the next one

### Feedback System
- Instant visual feedback with color-coding for correct/incorrect answers
- Sound effects for actions:
  - Clicking options and buttons
  - Correct answers
  - Incorrect answers
  - Using power-ups
  - Completing the quiz

### Progress Tracking
- Progress bar shows your advancement through the quiz
- Question counter displays current question number and total questions
- Performance statistics are compiled throughout the game and displayed at the end

## Project Structure

- `client/` - Frontend React application
  - `src/components/` - UI components
  - `src/lib/` - Utility functions and API services
  - `src/pages/` - Main page components
- `server/` - Backend Express server
- `shared/` - Shared types and schemas

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Acknowledgements

- [Open Trivia Database](https://opentdb.com/) for providing the trivia API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

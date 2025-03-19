import { useState, useEffect } from 'react';

// Define the card data type
interface Card {
  id: number;
  type: 'question' | 'answer'; // Card type: question or answer
  content: string; // Question or answer text
  matched: boolean; // Whether the card has been matched
}

interface MatchItem {
    term: string;
    definition: string;
  }
export default function QuizGameComponent(data: any) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Transform the data
  const quizData = data?.data?.map((item:MatchItem) => ({
    question: item.term,
    answer: item.definition,
  }));

  // Initialize cards with shuffled questions and answers
  useEffect(() => {
    const questionCards: Card[] = quizData?.map(
        (item: { question: string; answer: string }, index:number) => ({
          id: index,
          type: "question",
          content: item.question,
          matched: false,
        })
      );
      
    const answerCards: Card[] = quizData?.map(
        (item: { question: string; answer: string }, index: number) => ({
          id: index + (quizData?.length || 0), // Ensure unique IDs
          type: "answer",
          content: item.answer,
          matched: false,
        })
      );

    const shuffledCards = [...questionCards, ...answerCards].sort(
      () => Math.random() - 0.5
    ); // Shuffle
    setCards(shuffledCards);
    setIsRunning(true); // Start the timer
  }, []);

  // Start the timer when the component mounts
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !cards.every((card) => card.matched)) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    // Stop the timer if all cards are matched
    if (cards.every((card) => card.matched)) {
      setIsRunning(false);
    }

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [isRunning, cards]);

  // Handle card selection
  const handleCardClick = (id: number) => {
    if (
      selectedCards.length < 2 &&
      !cards.find((card) => card.id === id)?.matched
    ) {
      setSelectedCards((prev) => [...prev, id]);

      if (selectedCards.length === 1) {
        const firstCard = cards.find((card) => card.id === selectedCards[0]);
        const secondCard = cards.find((card) => card.id === id);

        if (
            quizData &&
            (
              (firstCard?.type === "question" &&
                secondCard?.type === "answer" &&
                quizData.find((item:{question:string,content:string}) => item.question === firstCard?.content)?.answer ===
                  secondCard?.content) ||
              (firstCard?.type === "answer" &&
                secondCard?.type === "question" &&
                quizData.find((item:{answer:string}) => item.answer === firstCard?.content)?.question ===
                  secondCard?.content)
            )
          ) {
            setCards((prevCards) =>
              prevCards.map((card) =>
                card.id === firstCard?.id || card.id === secondCard?.id
                  ? { ...card, matched: true }
                  : card
              )
            );
          }
          

        setTimeout(() => setSelectedCards([]), 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 bg-gray-900 text-white min-h-screen p-8">

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
        {cards.map((card) => {
          if (card.matched) return null; // Hide matched cards
        //   return (
        //     <div
        //       key={card.id}
        //       className={`w-64 h-64 flex items-center justify-center p-4 rounded-lg shadow-lg cursor-pointer text-sm font-medium
        //               ${
        //                 selectedCards.includes(card.id)
        //                   ? 'bg-green-600 text-white'
        //                   : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        //               }`}
        //       onClick={() => handleCardClick(card.id)}
        //     >
        //       {card.content}
        //     </div>
        //   );
        const cleanedContent = card.content.replace(
            /\(.*?\) key: [a-z0-9-]+/g,
            ''
          ).trim();
      
          return (
            <div
              key={card.id}
              className={`w-64 h-64 flex items-center justify-center p-4 rounded-lg shadow-lg cursor-pointer text-sm font-medium
                          ${
                            selectedCards.includes(card.id)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
              onClick={() => handleCardClick(card.id)}
            >
              {cleanedContent}
            </div>
          );
      
        })}
      </div>

      {/* Game Over Message */}
      {cards.every((card) => card.matched) && (
        <div className="text-2xl font-bold text-green-500 mt-4">
          🎉 Congratulations! You matched all cards! 🎉
        </div>
      )}
    </div>
  );
}

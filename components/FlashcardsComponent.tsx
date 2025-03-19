import React, { useState } from 'react';
import { motion } from 'framer-motion';

// A single flip card component
function FlipCard({
  concept,
  explanation,
}: {
  concept: string;
  explanation: string;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-72 h-48 [transform-style:preserve-3d] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      // We'll animate a flip by rotating the card around Y-axis
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Front Side */}
      <div
        className="absolute w-full h-full rounded-lg shadow-lg flex items-center justify-center p-4
                   bg-gray-800 text-white"
        style={{
          backfaceVisibility: 'hidden', // Ensure the back face is hidden when this side is visible
        }}
      >
        <h2 className="text-xl font-bold text-center">{concept}</h2>
      </div>

      {/* Back Side */}
      <div
        className="absolute w-full h-full rounded-lg shadow-lg flex items-center justify-center p-4
                   bg-gray-700 text-white"
        style={{
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden', // Ensure the front face is hidden when this side is visible
        }}
      >
        <p className="text-center text-sm">{explanation}</p>
      </div>
    </motion.div>
  );
}

export default function Flashcards({
  flashCards,
}: {
  flashCards: { concept: string; explanation: string }[];
}) {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Concept Cards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 place-items-center">
        {flashCards.map((item, index) => (
          <FlipCard
            key={index}
            concept={item.concept}
            explanation={item.explanation}
          />
        ))}
      </div>
    </div>
  );
}
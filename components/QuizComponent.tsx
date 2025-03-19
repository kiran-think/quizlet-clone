// import { Card, CardContent } from '@/components/ui';

import { Card, CardContent } from "./ui/card";

export default function QuizComponent() {
  return (
    <Card className="w-full border-0 sm:border sm:h-fit shadow-lg mt-4">
      <CardContent>
        <h2 className="text-xl font-bold">Quiz</h2>
        <p>This is the quiz component.</p>
      </CardContent>
    </Card>
  );
}
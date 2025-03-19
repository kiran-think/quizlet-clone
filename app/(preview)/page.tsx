'use client';

import { FaQuestionCircle, FaPuzzlePiece, FaBook } from 'react-icons/fa'; // Import icons from react-icons
import { useState } from 'react';
import { experimental_useObject } from 'ai/react';
import { questionsSchema } from '@/lib/schemas';
import { set, z } from 'zod';
import { toast } from 'sonner';
import { FileUp, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Quiz from '@/components/quiz';
import { Link } from '@/components/ui/link';
import { generateQuizTitle } from './actions';
import { AnimatePresence, motion } from 'framer-motion';
import MatchesComponent from '@/components/MatchesComponent';
import Flashcards from '@/components/FlashcardsComponent';

export default function ChatWithFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState<string>();

  const [nav, setNav] = useState('');
  const [loading, setLoading] = useState(false);

  const [quizeGenerated, setQuizGenerated] = useState(false);
  const [quiz, setQuiz] = useState();
  const [flashcards, setFlashcards] = useState([]);
  // const [matches, setMatches] = useState();
  const [matches, setMatches] = useState<{ data: any[] } | any[]>([]);


  const {
    submit,
    object: partialQuestions,
  } = experimental_useObject({
    api: '/api/generate-flashcard',
    schema: z.any(),
    initialValue: undefined,
    onError: (error) => {
      toast.error('Failed to generate Quiz');
      setFiles([]);
    },
    onFinish: ({ object }) => {
      setFlashcards(object ?? []);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        'Safari does not support drag & drop. Please use the file picker.'
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024
    );
    console.log(validFiles);

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Only PDF files under 5MB are allowed.');
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // let encodedFiles;
    const encodedFiles: File[] = []; // Default to an empty array

    setLoading(true);
    try {
      // encodedFiles = await Promise.all(
      //   files.map(async (file) => ({
      //     name: file.name,
      //     type: file.type,
      //     data: await encodeFileAsBase64(file),
      //   }))
      // );
      // submit({ files: encodedFiles });

      // try {
      //   const response1 = await fetch('/api/generate-quiz', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ files: encodedFiles }),
      //   });

      //   if (!response1.ok) {
      //     throw new Error('Failed to generate Quiz');
      //   }

      //   const data1 = await response1.json();

      //   setQuiz(data1);
      //   setQuestions(data1);

      // } catch (error) {
      //   console.error(error);
      //   toast.error('Failed to generate Quiz');
      // }

      // try {
      //   const response2 = await fetch('/api/generate-matches', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ files: encodedFiles }),
      //   });

      //   if (!response2.ok) {
      //     throw new Error('Failed to generate Matches');
      //   }

      //   const data2 = await response2.json();
      //   setMatches(data2);
      // } catch (error) {
      //   console.error(error);
      //   toast.error('Failed to generate Matches');
      // }

          // Encode files to Base64
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      }))
    );

    // Submit files for processing
    submit({ files: encodedFiles });

    // Make API calls in parallel
    const [quizResponse, matchesResponse] = await Promise.all([
      fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: encodedFiles }),
      }),
      fetch('/api/generate-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: encodedFiles }),
      }),
    ]);

    // Handle quiz response
    if (!quizResponse.ok) {
      throw new Error('Failed to generate Quiz');
    }
    const quizData = await quizResponse.json();
    setQuiz(quizData);
    setQuestions(quizData);

    // Handle matches response
    if (!matchesResponse.ok) {
      throw new Error('Failed to generate Matches');
    }
    const matchesData = await matchesResponse.json();
    setMatches(matchesData);

    // Generate quiz title
    const generatedTitle = await generateQuizTitle(encodedFiles[0].name);
    setTitle(generatedTitle);

    // Mark quiz as generated
    setQuizGenerated(true);
    } finally {
      setQuizGenerated(true);
      setLoading(false)
    }
    if (!encodedFiles || encodedFiles?.length === 0) {
      console.error("No files found in encodedFiles");
      return;
    }
    
    const generatedTitle = await generateQuizTitle(encodedFiles[0]?.name);
    setTitle(generatedTitle);
  };

  const clearPDF = () => {
    setFiles([]);
    setQuestions([]);
  };

  const progress = partialQuestions ? (partialQuestions.length / 4) * 100 : 0;

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        console.log(e.dataTransfer.files);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {'(PDFs only)'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center w-full max-w-full mt-12 space-y-4 bg-re d-600">
        {!quizeGenerated ? (
          <Card className="w-full border-0 sm:border sm:h-fit max-w-xl">
            <CardHeader className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileUp className="h-6 w-6" />
                </div>
                <Plus className="h-4 w-4" />
                <div className="rounded-full bg-primary/10 p-2">
                  <Loader2 className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">
                  PDF Quiz Generator
                </CardTitle>
                <CardDescription className="text-base">
                  Upload a PDF to generate an interactive quiz based on its
                  content using the{' '}
                  <Link href="https://sdk.vercel.ai">AI SDK</Link> and{' '}
                  <Link href="https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai">
                    Google&apos;s Gemini Pro
                  </Link>
                  .
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitWithFiles} className="space-y-4">
                <div
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50`}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    {files.length > 0 ? (
                      <span className="font-medium text-foreground">
                        {files[0].name}
                      </span>
                    ) : (
                      <span>Drop your PDF here or click to browse.</span>
                    )}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={files.length === 0}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Quiz...</span>
                    </span>
                  ) : (
                    'Generate Quiz'
                  )}
                </Button>
              </form>
            </CardContent>
            {loading && (
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  {/* <Progress value={progress} className="h-2" /> */}
                </div>
                <div className="w-full space-y-2">
                  <div className="grid grid-cols-6 sm:grid-cols-4 items-center space-x-2 text-sm">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        loading
                          ? 'bg-yellow-500/50 animate-pulse'
                          : 'bg-muted'
                      }`}
                    />
                    <span className="text-muted-foreground text-center col-span-4 sm:col-span-2">
                      {/* {partialQuestions
                        ? `Generating question ${
                            partialQuestions.length + 1
                          } of 4`
                        : 'Analyzing PDF content'} */}
                    </span>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        ) : null}

        {/* Navigation Card */}
        {quizeGenerated && (
          <Card className="w-full border-0 sm:border sm:h-fit">
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full p-7 text-2xl mx-auto text-center w-full my-6"
            >
              Start new Quiz
            </Button>
            <CardContent className="flex flex-col space-y-4">
              <div className="w-full space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  {/* <span>Navigation</span> */}
                </div>
                <div className="flex flex-row gap-4">
                  <Button
                    onClick={() => setNav('quiz')}
                    className="w-full flex items-center justify-center gap-2 py-16 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-300"
                  >
                    <FaQuestionCircle className="text-3xl" />
                    Quiz
                  </Button>
                  <Button
                    onClick={() => setNav('matches')}
                    className="w-full flex items-center justify-center gap-2 py-16 text-2xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all duration-300"
                  >
                    <FaPuzzlePiece className="text-3xl" />
                    Matches
                  </Button>
                  <Button
                    onClick={() => setNav('flashcards')}
                    className="w-full flex items-center justify-center gap-2 py-16 text-2xl font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-all duration-300"
                  >
                    <FaBook className="text-3xl" />
                    Flashcards
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="w-full">
          {nav === 'quiz' && (
            <Quiz
              title={title ?? 'Quiz'}
              questions={questions}
              clearPDF={clearPDF}
            />
          )}
          {nav === 'matches' && (
            <MatchesComponent
              data={Array.isArray(matches) ? matches : matches?.data}
            />
          )}
          {nav === 'flashcards' && <Flashcards flashCards={flashcards} />}
        </div>
      </div>
    </div>
  );
}

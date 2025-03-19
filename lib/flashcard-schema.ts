import { z } from "zod";

export const flashcardSchema = z.object({
  concept: z.string().describe("The key concept or term for the flashcard."),
  explanation: z.string().describe("A concise and clear explanation of the concept."),
});

export type Flashcard = z.infer<typeof flashcardSchema>;

export const flashcardsSchema = z.array(flashcardSchema).min(1).describe("An array of flashcards.");

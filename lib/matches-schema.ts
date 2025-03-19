import { z } from "zod";

export const matchSchema = z.object({
  term: z.string().describe("A key concept, vocabulary word, or phrase."),
  definition: z.string().describe("The corresponding definition or explanation."),
});

export type Match = z.infer<typeof matchSchema>;

export const matchesSchema = z
  .array(matchSchema)
  .min(5)
  .describe("An array of at least 5 matching term-definition pairs.");

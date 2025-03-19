import { flashcardSchema, flashcardsSchema } from "@/lib/flashcard-schema";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  const result = streamObject({
    model: google("gemini-2.0-flash-001"),
    messages: [
      {
        role: "system",
        content:
        "You are an expert educator. Your job is to take a document and generate exactly 9 study flashcards. Each flashcard should include a concise and engaging concept name and a clear, informative answer. Ensure each flashcard covers one key concept only. Do not generate more than 9 flashcards."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create a set of study flashcards based on this document.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: flashcardSchema,
    output: "array",
    onFinish: ({ object }) => {
      const res = flashcardsSchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}

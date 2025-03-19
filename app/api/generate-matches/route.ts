import { matchesSchema, matchSchema } from '@/lib/matches-schema';
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  const result = streamObject({
    model: google('gemini-2.0-flash-001'),
    messages: [
      {
        role: 'system',
        content:
          `You are an expert educator. Your job is to analyze the provided document and generate a set of matching questions. Each question should include a list of terms (key concepts, vocabulary, or important phrases) and their corresponding definitions (clear and concise explanations). The terms and definitions should be shuffled to ensure students must correctly match them. Provide at least 5 term-definition pairs. Each item should include a unique identifier uuid as a value for a key named \"key\".`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Create a set of matching questions based on this document.',
          },
          {
            type: 'file',
            data: firstFile,
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
    schema: matchSchema,
    output: 'array',
    onFinish: ({ object }) => {
      const processedObject = object?.map((item: any) => ({
        id: uuidv4(),
        ...item,
      }));

      const res = matchesSchema.safeParse(processedObject);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join('\n'));
      }
    },
  });

  return result.toTextStreamResponse();;
}

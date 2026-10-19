import { z } from "zod";

export const MAX_QUESTION_LENGTH = 280;

export const createQuestionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Please enter a question.")
    .max(MAX_QUESTION_LENGTH, `Keep it under ${MAX_QUESTION_LENGTH} characters.`),
  // Honeypot: real users never fill this in.
  website: z.string().optional(),
});

export const idSchema = z.uuid();

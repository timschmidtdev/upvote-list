"use client";

import { useQuestions } from "@/lib/use-questions";
import { QuestionCard } from "./QuestionCard";
import { QuestionForm } from "./QuestionForm";

export function QuestionList() {
  const { questions, voted, error, addQuestion, toggleVote } = useQuestions();

  return (
    <>
      <section aria-label="Add a question" className="sticky top-0 z-10 -mx-4 border-b border-zinc-200 bg-zinc-50/95 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-black/95">
        <QuestionForm onAdded={addQuestion} />
      </section>

      <section aria-label="Questions" className="mt-4">
        {error && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        {questions === null ? (
          <p className="py-8 text-center text-zinc-500">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="py-8 text-center text-zinc-500">No questions yet. Be the first to add one.</p>
        ) : (
          <ul className="space-y-3">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                voted={voted.has(q.id)}
                onToggle={() => toggleVote(q.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

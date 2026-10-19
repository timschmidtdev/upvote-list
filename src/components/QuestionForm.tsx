"use client";

import { useState } from "react";
import type { Question } from "@/lib/use-questions";

const MAX = 280;

export function QuestionForm({ onAdded }: { onAdded: (q: Question) => void }) {
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return setError("Please enter a question.");
    if (trimmed.length > MAX) return setError(`Keep it under ${MAX} characters.`);

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, website }),
      });
      if (res.status === 429) {
        return setError("You're adding questions quickly. Please try again in a bit.");
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) return setError(data?.error ?? "Something went wrong. Please try again.");
      onAdded(data);
      setText("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-2">
      <label htmlFor="question" className="block text-sm font-medium">
        Your question
      </label>
      <textarea
        id="question"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "question-error" : undefined}
        placeholder="What should we talk about?"
        className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p
          id="question-error"
          role="alert"
          className="min-h-5 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
        <span className="text-xs tabular-nums text-zinc-500">
          {text.length}/{MAX}
        </span>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}

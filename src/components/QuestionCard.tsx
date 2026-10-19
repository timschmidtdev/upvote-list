import type { Question } from "@/lib/use-questions";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function QuestionCard({
  question,
  voted,
  onToggle,
}: {
  question: Question;
  voted: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={voted}
        aria-label={`Upvote: ${question.text}`}
        className={`flex min-h-14 min-w-14 flex-col items-center justify-center rounded-lg border text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          voted
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
      >
        <span aria-hidden="true">▲</span>
        <span className="tabular-nums">{question.votes}</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap break-words">{question.text}</p>
        <p className="mt-1 text-xs text-zinc-500" suppressHydrationWarning>
          {timeAgo(question.createdAt)}
        </p>
      </div>
    </li>
  );
}

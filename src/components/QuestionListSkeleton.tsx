const LINE_WIDTHS = ["w-11/12", "w-4/5", "w-3/4"];

function SkeletonCard({ lineWidth }: { lineWidth: string }) {
  return (
    <li
      aria-hidden="true"
      className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="min-h-14 min-w-14 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      {/* Line boxes mirror the real card's text line (h-6) and timestamp (h-4) so heights match. */}
      <div className="min-w-0 flex-1">
        <div className="flex h-6 items-center">
          <div className={`h-4 rounded bg-zinc-200 dark:bg-zinc-800 ${lineWidth}`} />
        </div>
        <div className="mt-1 flex h-4 items-center">
          <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      </div>
    </li>
  );
}

export function QuestionListSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading questions…</span>
      <ul className="space-y-3 motion-safe:animate-pulse">
        {LINE_WIDTHS.map((w) => (
          <SkeletonCard key={w} lineWidth={w} />
        ))}
      </ul>
    </div>
  );
}

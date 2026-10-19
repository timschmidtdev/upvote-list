import { QuestionList } from "@/components/QuestionList";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16">
      <header className="py-6">
        <h1 className="text-2xl font-bold">Book Club Questions</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Add a question, then upvote the ones you want to discuss.
        </p>
      </header>
      <QuestionList />
    </main>
  );
}

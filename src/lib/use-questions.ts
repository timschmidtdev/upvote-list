"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadVoted, saveVoted } from "./votes-storage";

export type Question = {
  id: string;
  text: string;
  votes: number;
  createdAt: string;
};

const POLL_MS = 15_000;

const sortQuestions = (qs: Question[]) =>
  [...qs].sort(
    (a, b) =>
      b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const RATE_LIMIT_MSG = "You're doing that a lot. Please try again in a bit.";

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  // Cards only render after the first fetch, so reading storage at init can't cause a hydration mismatch.
  const [voted, setVoted] = useState<Set<string>>(() =>
    typeof window === "undefined" ? new Set() : loadVoted(),
  );
  const [error, setError] = useState<string | null>(null);
  const pendingVotes = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/questions", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data: Question[] = await res.json();
      // Don't clobber optimistic state with a response that predates an in-flight vote.
      if (pendingVotes.current === 0) setQuestions(data);
    } catch {
      setQuestions((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const first = setTimeout(refresh, 0);
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  const addQuestion = useCallback((q: Question) => {
    setQuestions((prev) => sortQuestions([q, ...(prev ?? [])]));
  }, []);

  const toggleVote = useCallback(
    async (id: string) => {
      const wasVoted = voted.has(id);
      const delta = wasVoted ? -1 : 1;
      const applyDelta = (d: number) =>
        setQuestions((prev) =>
          prev && sortQuestions(prev.map((q) => (q.id === id ? { ...q, votes: Math.max(0, q.votes + d) } : q))),
        );
      const setVotedState = (on: boolean) =>
        setVoted((prev) => {
          const next = new Set(prev);
          if (on) next.add(id);
          else next.delete(id);
          saveVoted(next);
          return next;
        });

      setError(null);
      applyDelta(delta);
      setVotedState(!wasVoted);
      pendingVotes.current++;
      try {
        const res = await fetch(`/api/questions/${id}/vote`, { method: wasVoted ? "DELETE" : "POST" });
        if (!res.ok) {
          const err = new Error(res.status === 429 ? RATE_LIMIT_MSG : "Couldn't save your vote. Please try again.");
          throw err;
        }
      } catch (e) {
        applyDelta(-delta);
        setVotedState(wasVoted);
        setError(e instanceof Error ? e.message : "Couldn't save your vote. Please try again.");
      } finally {
        pendingVotes.current--;
        if (pendingVotes.current === 0) refresh();
      }
    },
    [voted, refresh],
  );

  return { questions, voted, error, addQuestion, toggleVote };
}

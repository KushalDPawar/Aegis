"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Textarea, Alert } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { submitIntentAnswerAction } from "@/lib/actions/payments";

interface Turn {
  question: string;
  answer: string;
}

export function IntentCheckChat({
  transactionId,
  history,
  initialQuestion,
}: {
  transactionId: string;
  history: Turn[];
  initialQuestion: string | null;
}) {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>(history);
  const [question, setQuestion] = useState<string | null>(initialQuestion);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, question]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !answer.trim()) return;
    setLoading(true);
    setError(null);
    const askedQuestion = question;
    const result = await submitIntentAnswerAction({ transactionId, answer });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setTurns((prev) => [...prev, { question: askedQuestion, answer }]);
    setAnswer("");
    setLoading(false);

    if (result.data.finalized) {
      router.push(`/pay/${transactionId}/guard`);
      return;
    }
    setQuestion(result.data.followUpQuestion);
  }

  return (
    <div>
      <div className="space-y-4 max-h-[360px] overflow-y-auto scrollbar-thin pr-1 mb-5" aria-live="polite">
        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-start">
              <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/8 px-4 py-2.5 text-sm text-cream-100">
                {t.question}
              </p>
            </div>
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-signal-teal/12 border border-signal-teal/25 px-4 py-2.5 text-sm text-cream-100">
                {t.answer}
              </p>
            </div>
          </div>
        ))}
        {question && (
          <div className="flex justify-start">
            <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/8 px-4 py-2.5 text-sm text-cream-100">
              {question}
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <div className="mb-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {question ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="intent-answer" className="sr-only">
            Your answer
          </label>
          <Textarea
            id="intent-answer"
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer in your own words…"
            required
            minLength={1}
          />
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            Send
          </Button>
        </form>
      ) : (
        <p className="text-sm text-cream-100/50">Thanks — reviewing your answers…</p>
      )}
    </div>
  );
}

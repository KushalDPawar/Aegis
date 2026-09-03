import React, { useState, useEffect, useRef } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { PillButton } from '../common/PillButton';
import { StatusBadge } from '../common/StatusBadge';
import { MessageSquare, Send, Shield, Sparkles, User, AlertCircle, Loader2 } from 'lucide-react';

export const ContextInterview: React.FC = () => {
  const { simulationState, submitInterviewResponse } = useIntelligence();
  const { dialogueMessages, interviewCompleted, isAnalyzing, isInterviewThinking } = simulationState;
  const [inputText, setInputText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chatbox to bottom when messages update
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [dialogueMessages.length, isInterviewThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAnalyzing || isInterviewThinking) return;
    submitInterviewResponse(inputText);
    setInputText('');
  };

  const handleSelectQuickOption = (option: string) => {
    if (isAnalyzing || isInterviewThinking) return;
    submitInterviewResponse(option);
  };

  // Ensure dialogue stream contains only unique messages
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set<string>();
    return dialogueMessages.filter(msg => {
      const key = `${msg.sender}-${msg.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [dialogueMessages]);

  return (
    <HairlineCard className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-accent-cyan" />
            <h3 className="font-display text-xl font-bold text-ink">
              Tell Us More
            </h3>
          </div>
          <p className="font-sans text-sm text-ink-dim mt-1">
            We ask a few quick questions to better understand your situation and spot potential coercion.
          </p>
        </div>

        <StatusBadge
          label={
            interviewCompleted
              ? 'CONTEXT REASONED'
              : isInterviewThinking
              ? 'REASONING…'
              : 'INTERVIEW ACTIVE'
          }
          tone={interviewCompleted ? 'emerald' : isInterviewThinking ? 'amber' : 'cyan'}
          pulse={!interviewCompleted || isInterviewThinking}
          size="sm"
        />
      </div>

      {/* Dialogue Stream */}
      <div ref={scrollContainerRef} className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scroll-smooth">
        {uniqueMessages.map((msg, index) => {
          const isSentinel = msg.sender === 'sentinel';
          const isCritical = msg.urgencyLevel === 'critical';
          const isCaution = msg.urgencyLevel === 'caution';
          const isLastMessage = index === uniqueMessages.length - 1;

          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3 ${isSentinel ? '' : 'flex-row-reverse'} animate-soft-in`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs ${
                  isSentinel
                    ? isCritical
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                      : 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan'
                    : 'border-hairline bg-paper-elevated text-ink-muted'
                }`}
              >
                {isSentinel ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border transition-all ${
                  isSentinel
                    ? isCritical
                      ? 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 text-ink'
                      : isCaution
                      ? 'border-hairlineStrong bg-paper-elevated text-ink'
                      : 'border-hairline bg-paper-elevated text-ink'
                    : 'border-accent-cyan/30 bg-accent-cyan/10 text-ink'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5 font-mono text-[10px] text-ink-dim">
                  <span>{isSentinel ? 'SENTINEL COGNITIVE AUDIT' : 'DEEPAK SHARMA (USER)'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line font-sans">
                  {msg.text}
                </div>

                {/* Highlighted Linguistic Tokens */}
                {msg.highlightTokens && msg.highlightTokens.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-hairline/60 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-ink-dim">DETECTED LINGUISTIC MARKERS:</span>
                    {msg.highlightTokens.map((token, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold uppercase"
                      >
                        [{token}]
                      </span>
                    ))}
                  </div>
                )}

                {/* Pre-built quick options on the latest message */}
                {msg.options && isLastMessage && !isInterviewThinking && msg.options.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-hairline/60 space-y-2">
                    <span className="block font-mono text-[11px] text-ink-dim uppercase">
                      Suggested Responses & Follow-ups:
                    </span>
                    <div className="flex flex-col gap-2">
                      {msg.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          disabled={isAnalyzing || isInterviewThinking}
                          onClick={() => handleSelectQuickOption(opt)}
                          className="text-left rounded-lg border border-hairline bg-paper-surface hover:bg-hairline/15 p-2.5 font-sans text-xs text-ink transition-all hover:border-accent-cyan/50 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          &quot;{opt}&quot;
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Cognitive Reasoning in-progress indicator */}
        {isInterviewThinking && (
          <div className="flex items-start gap-3 animate-soft-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan font-mono text-xs">
              <Shield className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl border border-accent-cyan/30 bg-paper-elevated p-3.5 text-xs text-ink flex items-center gap-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-accent-cyan shrink-0" />
              <span className="font-mono text-ink-dim">
                Sentinel Cognitive Engine is evaluating linguistic markers & intent…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-hairline">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isAnalyzing || isInterviewThinking}
          placeholder={
            isInterviewThinking
              ? 'Analyzing context response…'
              : 'Explain the context or who requested this transfer...'
          }
          className="flex-1 rounded-lg border border-hairline bg-paper-elevated px-3.5 py-2 font-sans text-sm text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan disabled:opacity-50"
        />
        <PillButton
          variant="primary"
          size="md"
          disabled={!inputText.trim() || isAnalyzing || isInterviewThinking}
          icon={<Send className="h-3.5 w-3.5" />}
        >
          Send
        </PillButton>
      </form>
    </HairlineCard>
  );
};

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import anime from "animejs";
import { useIsCompactViewport, useReducedMotion } from "@/lib/hero-network/use-media-flags";

export interface ScenarioSlide {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  /** Leading verdict token parsed from the scenario's expected outcome. */
  outcome: string;
}

/**
 * Verdict colours reuse the signal palette the risk UI already maps severity
 * onto (see `lib/risk/colors.ts`), so a PAUSE on the landing page reads the
 * same as a PAUSE inside the product.
 */
const OUTCOME_TONE: Record<string, string> = {
  PAUSE: "text-signal-crimson border-signal-crimson/40",
  WARN: "text-signal-coral border-signal-coral/40",
  COOLING_PERIOD: "text-signal-coral border-signal-coral/40",
  VERIFY: "text-signal-amber border-signal-amber/40",
  ALLOW: "text-signal-jade border-signal-jade/40",
};

/**
 * Horizontal carousel over the Scenario Lab's real cases.
 *
 * Depth rather than decoration: the active slide sits forward at full
 * strength, its neighbours recede on the z axis. Anime.js drives the track,
 * per-slide depth is a CSS transition so the browser can composite it.
 * Drag, arrows, dots, keyboard and swipe all move the same index.
 */
export function ScenarioCarousel({ slides }: { slides: ScenarioSlide[] }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<anime.AnimeInstance | null>(null);
  const offsetRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, startOffset: 0, moved: false, pointerId: -1 });

  const reducedMotion = useReducedMotion();
  const compact = useIsCompactViewport();
  const perView = compact ? 1 : 2;
  const count = slides.length;
  const maxIndex = Math.max(0, count - perView);

  const slideWidth = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return 0;
    return vp.clientWidth / perView;
  }, [perView]);

  /** Writes the track transform from offsetRef. */
  const paint = useCallback(() => {
    const track = trackRef.current;
    if (track) track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  }, []);

  const settleTo = useCallback(
    (next: number, animate = true) => {
      const clamped = Math.max(0, Math.min(maxIndex, next));
      setIndex(clamped);
      const target = -clamped * slideWidth();
      animRef.current?.pause();
      if (!animate || reducedMotion) {
        offsetRef.current = target;
        paint();
        return;
      }
      animRef.current = anime({
        targets: offsetRef,
        current: target,
        duration: 720,
        easing: "cubicBezier(0.2, 0.8, 0.2, 1)",
        update: paint,
      });
    },
    [maxIndex, slideWidth, reducedMotion, paint]
  );

  // Keep the offset honest when the viewport resizes under us.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => {
      animRef.current?.pause();
      offsetRef.current = -Math.min(index, maxIndex) * slideWidth();
      paint();
    });
    ro.observe(vp);
    return () => ro.disconnect();
  }, [index, maxIndex, slideWidth, paint]);

  useEffect(() => () => animRef.current?.pause(), []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    animRef.current?.pause();
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startOffset: offsetRef.current,
      moved: false,
      pointerId: e.pointerId,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    // Rubber-band past the ends instead of stopping dead.
    const raw = d.startOffset + dx;
    const min = -maxIndex * slideWidth();
    const over = raw > 0 ? raw : raw < min ? raw - min : 0;
    offsetRef.current = raw - over * 0.65;
    paint();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    if (e.currentTarget.hasPointerCapture(d.pointerId)) e.currentTarget.releasePointerCapture(d.pointerId);
    const w = slideWidth();
    settleTo(w > 0 ? Math.round(-offsetRef.current / w) : index);
  };

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="carousel"
      aria-label="Scenario Lab cases"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          settleTo(index + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          settleTo(index - 1);
        }
      }}
    >
      <div
        ref={viewportRef}
        className="overflow-hidden touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="flex will-change-transform" style={{ transform: "translate3d(0,0,0)" }}>
          {slides.map((s, i) => {
            const distance = Math.abs(i - index);
            const recessed = distance >= perView;
            return (
              <div
                key={s.code}
                className="shrink-0 px-2.5 first:pl-0 last:pr-0"
                style={{ width: `${100 / perView}%` }}
                aria-hidden={recessed}
              >
                <article
                  className="glass-panel rounded-2xl p-7 h-full select-none transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{
                    transform: reducedMotion ? undefined : `scale(${recessed ? 0.94 : 1})`,
                    opacity: recessed ? 0.42 : 1,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-signal-teal/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.14em] border rounded-full px-2.5 py-1 ${
                        OUTCOME_TONE[s.outcome] ?? "text-cream-100/50 border-white/15"
                      }`}
                    >
                      {s.outcome}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-medium text-cream-100 mt-4">{s.title}</h3>
                  <p className="font-mono text-[11px] text-cream-100/40 mt-2">{s.subtitle}</p>
                  <p className="text-sm text-cream-100/55 mt-4 leading-relaxed">{s.description}</p>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <div className="flex gap-2" role="tablist" aria-label="Select case">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Case ${i + 1} of ${maxIndex + 1}`}
              onClick={() => settleTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-7 bg-signal-teal/70" : "w-1.5 bg-white/20 hover:bg-white/35"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <CarouselArrow direction="prev" disabled={index === 0} onClick={() => settleTo(index - 1)} />
          <CarouselArrow direction="next" disabled={index >= maxIndex} onClick={() => settleTo(index + 1)} />
        </div>
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous case" : "Next case"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-cream-100 transition-all duration-300 hover:border-signal-teal/50 hover:-translate-y-0.5 disabled:opacity-30 disabled:pointer-events-none"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={direction === "prev" ? "M12.5 8h-9M7.5 3.5L3 8l4.5 4.5" : "M3.5 8h9M8.5 3.5L13 8l-4.5 4.5"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

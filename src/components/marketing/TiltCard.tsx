"use client";

import { useCallback, useEffect, useRef } from "react";
import anime from "animejs";
import { useIsCompactViewport, useReducedMotion } from "@/lib/hero-network/use-media-flags";

/**
 * Pointer-reactive wrapper for the landing cards. It adds motion only — the
 * card's own styling comes entirely from `className`, so the panels keep the
 * exact look they already had.
 *
 * One mutable state object holds tilt and lift, and a single `apply()` writes
 * the composed transform. Tilt is written straight from pointermove (tracking
 * a cursor has to be immediate, and a tween per pointer event would fight
 * itself); Anime.js drives only the parts that should ease — the lift on
 * enter, and the settle back to flat on leave.
 */
export function TiltCard({
  children,
  className = "",
  maxTilt = 5,
}: {
  children: React.ReactNode;
  className?: string;
  /** Degrees of rotation at the card's corners. Small on purpose. */
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ rx: 0, ry: 0, lift: 0 });
  const animRef = useRef<anime.AnimeInstance | null>(null);

  const reducedMotion = useReducedMotion();
  const compact = useIsCompactViewport();
  const interactive = !reducedMotion && !compact;

  const apply = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { rx, ry, lift } = state.current;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) translateY(${-lift.toFixed(3)}px)`;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      // Drives the CSS ::after spotlight gradient.
      el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
      state.current.rx = (0.5 - py) * maxTilt * 2;
      state.current.ry = (px - 0.5) * maxTilt * 2;
      apply();
    },
    [interactive, maxTilt, apply]
  );

  const onPointerEnter = useCallback(() => {
    if (!interactive) return;
    animRef.current?.pause();
    animRef.current = anime({
      targets: state.current,
      lift: 6,
      duration: 420,
      easing: "cubicBezier(0.2, 0.7, 0.2, 1)",
      update: apply,
    });
  }, [interactive, apply]);

  const onPointerLeave = useCallback(() => {
    if (!interactive) return;
    const el = ref.current;
    animRef.current?.pause();
    animRef.current = anime({
      targets: state.current,
      rx: 0,
      ry: 0,
      lift: 0,
      duration: 620,
      easing: "cubicBezier(0.2, 0.8, 0.2, 1)",
      update: apply,
    });
    el?.style.removeProperty("--mx");
    el?.style.removeProperty("--my");
  }, [interactive, apply]);

  // If the viewport crosses into compact (or reduced motion turns on) while a
  // card is mid-tilt it would otherwise stay stuck at an angle forever.
  useEffect(() => {
    if (interactive) return;
    animRef.current?.pause();
    state.current = { rx: 0, ry: 0, lift: 0 };
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  }, [interactive]);

  useEffect(() => () => animRef.current?.pause(), []);

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={`spotlight-card relative overflow-hidden ${className}`}
      style={{ willChange: interactive ? "transform" : undefined }}
    >
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import anime from "animejs";
import { useReducedMotion } from "@/lib/hero-network/use-media-flags";

const HIDDEN: React.CSSProperties = { opacity: 0 };

/**
 * The closing statement, and the page's only light surface.
 *
 * Everything above it is ink; landing on paper at the end is the point — the
 * product's argument is that protection should not end in exclusion, so the
 * page finishes somewhere open rather than somewhere dark. The two reaching
 * hands carry that without a line of copy explaining it, and the headline sits
 * in the gap between the fingertips.
 */
export function ReachSection() {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const captionsRef = useRef<HTMLDivElement>(null);

  // The entrance is tied to the section scrolling into view, not to page load —
  // by the time anyone reaches this it would otherwise have already played.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = [kickerRef.current, headingRef.current, subRef.current, ctaRef.current, captionsRef.current];

    if (reducedMotion) {
      targets.forEach((el) => {
        if (!el) return;
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.transform = "none";
      });
      return;
    }

    let tl: anime.AnimeTimelineInstance | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tl = anime.timeline({ easing: "cubicBezier(0.2, 0.7, 0.2, 1)" });
        tl.add({ targets: kickerRef.current, opacity: [0, 1], translateY: [24, 0], filter: ["blur(14px)", "blur(0px)"], duration: 900 }, 0)
          .add({ targets: headingRef.current, opacity: [0, 1], translateY: [34, 0], filter: ["blur(20px)", "blur(0px)"], duration: 1050 }, 120)
          .add({ targets: subRef.current, opacity: [0, 1], translateY: [24, 0], filter: ["blur(12px)", "blur(0px)"], duration: 900 }, 280)
          .add({ targets: ctaRef.current, opacity: [0, 1], translateY: [20, 0], filter: ["blur(10px)", "blur(0px)"], duration: 850 }, 400)
          .add({ targets: captionsRef.current, opacity: [0, 1], duration: 700 }, 560);
      },
      { threshold: 0.2 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      tl?.pause();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      className="reach-backdrop relative isolate min-h-[100dvh] overflow-hidden flex flex-col"
    >
      <div className="reach-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.35]" aria-hidden="true" />

      {/* The halftone drops its white straight onto the paper via multiply, so
          there is no card edge around the illustration. Positioned directly
          rather than inside a wrapper: an absolutely-positioned image in a
          zero-height parent never satisfied the loader's visibility check, so
          it silently never fetched. */}
      <Image
        src="/media/reach.png"
        alt=""
        width={1372}
        height={768}
        sizes="(max-width: 768px) 168vw, max(1080px, 100vw)"
        className="reach-art pointer-events-none absolute left-1/2 top-[50%] z-[2] h-auto w-[max(1080px,100vw)] max-w-none max-md:w-[168vw]"
        aria-hidden="true"
      />

      <div className="reach-bloom pointer-events-none absolute left-1/2 top-[50%] z-[3] w-[min(860px,86vw)] aspect-[1.55/1] -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 pb-16 pt-24">
        <p
          ref={kickerRef}
          className="js-hero-reveal flex items-center gap-3.5 font-mono text-xs font-medium uppercase tracking-[0.4em] text-[#5c6b78]"
          style={HIDDEN}
        >
          <span className="h-px w-7 bg-[#5c6b78]/60" aria-hidden="true" />
          Decision integrity
          <span className="h-px w-7 bg-[#5c6b78]/60" aria-hidden="true" />
        </p>

        <h2
          ref={headingRef}
          className="js-hero-reveal mt-8 font-display leading-[1.0] tracking-[-0.04em] text-[clamp(2.875rem,6.4vw,5.5rem)]"
          style={HIDDEN}
        >
          <span className="block font-normal text-[#191b1e]/[0.82]">Protection should reach for people,</span>
          <span className="block font-extrabold text-[#191b1e]">not lock them out.</span>
        </h2>

        <p
          ref={subRef}
          className="js-hero-reveal mt-8 max-w-[30rem] text-[clamp(1rem,1.35vw,1.1875rem)] leading-[1.55] text-[#191b1e]/[0.62]"
          style={HIDDEN}
        >
          Aegis pauses the payment, not the person — proportionate friction, an explainable reason, and a way back to
          normal banking the moment it is safe.
        </p>

        <div ref={ctaRef} className="js-hero-reveal mt-10" style={HIDDEN}>
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 rounded-full bg-[#191b1e] pl-7 pr-6 py-3.5 text-[#f4f3ef] shadow-[0_14px_34px_-12px_rgba(25,27,30,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-12px_rgba(25,27,30,0.6)]"
          >
            <span className="font-display text-[15.5px] font-semibold">Enter the simulation</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M3.5 8h9M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <div
        ref={captionsRef}
        className="js-hero-reveal relative z-[11] hidden md:flex items-center justify-between px-14 pb-8 font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#191b1e]/[0.42]"
        style={HIDDEN}
      >
        <span>Authentication is not intent.</span>
        <span>Simulation only — no real accounts</span>
      </div>
    </section>
  );
}

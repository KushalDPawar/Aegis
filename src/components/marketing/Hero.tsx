"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import anime from "animejs";
import { useReducedMotion } from "@/lib/hero-network/use-media-flags";
import { FluidCursor } from "./FluidCursor";

const NAV_LINKS = [
  { href: "/lab", label: "Scenario Lab" },
  { href: "/impact", label: "Impact" },
  { href: "/status", label: "Security" },
  { href: "/login", label: "Sign in" },
];

/** Elements Anime.js drives directly start invisible so there's no flash of
 * fully-visible content before the entrance runs. */
const HIDDEN: React.CSSProperties = { opacity: 0 };

export function Hero() {
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaLinkRef = useRef<HTMLAnchorElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  // The film has to start on its own. Browsers reject autoplay in enough
  // situations (background tab at load, power saving, a stalled first frame)
  // that a muted+playsinline video still needs to be nudged.
  //
  // Under reduced motion it is held on a frame instead: a full-bleed looping
  // film is by far the largest movement on the page, and silencing the
  // typography's entrance while leaving it running would miss the point.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      // Seek to a composed frame so the still is a deliberate image rather
      // than whatever the first frame happens to be.
      const seek = () => {
        try {
          video.currentTime = 3.2;
        } catch {
          /* seeking before metadata is ready throws; the listener retries */
        }
      };
      if (video.readyState >= 1) seek();
      else video.addEventListener("loadedmetadata", seek, { once: true });
      return;
    }

    const kick = () => void video.play().catch(() => {});
    kick();
    video.addEventListener("canplay", kick);
    window.addEventListener("load", kick);
    return () => {
      video.removeEventListener("canplay", kick);
      window.removeEventListener("load", kick);
    };
  }, [reducedMotion]);

  // Decoding video for a hero nobody is looking at is pure waste — the
  // sections below are opaque, so once the hero is off screen the film is
  // invisible anyway.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    if (reducedMotion) return; // nothing to pause/resume; it is already held
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.01 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [reducedMotion]);

  // Entrance — one timeline, staggered blur-rise. Everything resolves out of
  // focus into place once; after that only the film keeps moving.
  useEffect(() => {
    const targets = [
      navRef.current,
      wordmarkRef.current,
      subRef.current,
      ctaRef.current,
      captionRef.current,
    ];

    if (reducedMotion) {
      targets.forEach((el) => {
        if (!el) return;
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.transform = "none";
      });
      return;
    }

    const ease = "cubicBezier(0.2, 0.7, 0.2, 1)";
    const tl = anime.timeline({ easing: ease });
    tl.add({ targets: navRef.current, opacity: [0, 1], translateY: [-14, 0], filter: ["blur(12px)", "blur(0px)"], duration: 900 }, 60)
      .add({ targets: wordmarkRef.current, opacity: [0, 1], translateY: [40, 0], filter: ["blur(22px)", "blur(0px)"], duration: 1150 }, 400)
      .add({ targets: subRef.current, opacity: [0, 1], translateY: [26, 0], filter: ["blur(14px)", "blur(0px)"], duration: 950 }, 620)
      .add({ targets: ctaRef.current, opacity: [0, 1], translateY: [20, 0], filter: ["blur(10px)", "blur(0px)"], duration: 850 }, 780)
      .add({ targets: captionRef.current, opacity: [0, 1], duration: 700 }, 960);

    return () => tl.pause();
  }, [reducedMotion]);

  function handleCtaEnter() {
    if (reducedMotion || !ctaLinkRef.current) return;
    anime({
      targets: ctaLinkRef.current,
      boxShadow: "0 18px 44px -18px rgba(94, 234, 212, 0.45)",
      duration: 420,
      easing: "easeOutQuad",
    });
  }
  function handleCtaLeave() {
    if (reducedMotion || !ctaLinkRef.current) return;
    anime({
      targets: ctaLinkRef.current,
      boxShadow: "0 0px 0px 0px rgba(94, 234, 212, 0)",
      duration: 420,
      easing: "easeOutQuad",
    });
  }

  return (
    <section ref={sectionRef} className="relative h-[100dvh] min-h-[640px] overflow-hidden">
      <video
        ref={videoRef}
        className="bg-film"
        src="/media/hero.mp4"
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      {/* Above the film, under the scrim: the trail catches light in the
          image rather than sitting on top of the interface. */}
      <FluidCursor className="z-[1]" />
      {/* Absolute, not fixed. A fixed overlay escapes the hero and tints every
          section below it for the whole length of the page — which is what was
          turning the light closing section grey. The section clips these. */}
      <div className="film-scrim pointer-events-none absolute inset-0 z-[2]" aria-hidden="true" />
      <div className="film-vignette pointer-events-none absolute inset-0 z-[3]" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col">
        <nav ref={navRef} className="js-hero-reveal flex justify-center px-6 lg:px-10 py-7" style={HIDDEN}>
          <ul className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-cream-100/70 hover:text-cream-100 transition-colors duration-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="md:hidden text-sm text-cream-100/70 hover:text-cream-100 transition-colors"
          >
            Sign in
          </Link>
        </nav>

        {/* Asymmetric anchor: the wordmark owns the bottom-left, the reading
            column sits opposite it. The middle of the frame stays empty so the
            film is the subject, not a backdrop. */}
        <div className="flex-1 flex items-end px-6 lg:px-10 pb-10 lg:pb-14">
          <div className="w-full grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <h1
              ref={wordmarkRef}
              className="js-hero-reveal font-display font-semibold text-cream-100 leading-[0.86] tracking-[-0.045em] text-[clamp(4.5rem,13vw,12.25rem)]"
              style={HIDDEN}
            >
              Aegis
              <span className="align-super text-[0.32em] font-medium text-signal-teal/80">*</span>
            </h1>

            <div className="lg:max-w-sm lg:pb-4">
              <p ref={subRef} className="js-hero-reveal text-cream-100/70 text-base leading-relaxed" style={HIDDEN}>
                Aegis protects vulnerable customers before, during, and after digital financial fraud — evaluating
                transaction risk and decision integrity as two separate questions, so protection never becomes
                exclusion.
              </p>
              <div ref={ctaRef} className="js-hero-reveal mt-7 flex flex-wrap items-center gap-4" style={HIDDEN}>
                <Link
                  ref={ctaLinkRef}
                  href="/login"
                  onMouseEnter={handleCtaEnter}
                  onMouseLeave={handleCtaLeave}
                  className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-md pl-6 pr-2 py-2 text-cream-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal-teal/50"
                >
                  <span className="text-sm font-medium">Enter the simulation</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal-teal text-ink-950 transition-transform duration-300 group-hover:rotate-45">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3.5 8h9M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/lab"
                  className="text-sm text-cream-100/60 hover:text-cream-100 transition-colors underline-offset-4 hover:underline"
                >
                  Watch it protect someone →
                </Link>
              </div>
              <p
                ref={captionRef}
                className="js-hero-reveal font-mono text-[11px] uppercase tracking-[0.12em] text-cream-100/40 mt-8"
                style={HIDDEN}
              >
                Simulation prototype — no real accounts connected
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useIsCompactViewport, useReducedMotion } from "@/lib/hero-network/use-media-flags";

/**
 * A soft fluid trail that follows the cursor across the hero.
 *
 * Deliberately not a Navier-Stokes sim: a full fluid solver is a large amount
 * of WebGL for an effect that, on a security product, has to stay in the
 * background. This advects a small pool of particles along the pointer's
 * velocity with drag and lateral spread, and paints them additively with soft
 * radial falloff — which reads as light moving through the frame rather than a
 * cursor toy, and costs a fraction of a frame.
 *
 * Pointer velocity drives emission, so a still cursor produces nothing at all;
 * the effect only exists while the user is actually moving.
 */

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 -> 0
  decay: number;
  radius: number;
}

const MAX_DROPS = 160;

export function FluidCursor({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const compact = useIsCompactViewport();

  useEffect(() => {
    // No hovering cursor to track on touch, and motion-sensitive users should
    // not get a trail chasing their pointer at all.
    if (reducedMotion || compact) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Fixed-size pool, reused forever — no allocation in the loop.
    const drops: Drop[] = Array.from({ length: MAX_DROPS }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      decay: 0,
      radius: 0,
    }));
    let cursor = 0;

    const pointer = { x: 0, y: 0, px: 0, py: 0, active: false, seeded: false };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!pointer.seeded) {
        pointer.px = x;
        pointer.py = y;
        pointer.seeded = true;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.seeded = false;
    };

    const parent = canvas.parentElement ?? canvas;
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    let rafId = 0;
    let last = performance.now();

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || width === 0 || height === 0) return;

      // --- Emit ----------------------------------------------------------
      const dx = pointer.x - pointer.px;
      const dy = pointer.y - pointer.py;
      const speed = Math.hypot(dx, dy);
      if (pointer.active && speed > 0.6) {
        // Faster movement seeds more of the trail, so the effect has weight
        // rather than a constant drip.
        const count = Math.min(4, 1 + Math.floor(speed / 26));
        for (let i = 0; i < count; i++) {
          const t = (i + 1) / count;
          const d = drops[cursor];
          cursor = (cursor + 1) % MAX_DROPS;
          // Spread perpendicular to travel — this is what makes it read as
          // fluid spreading rather than a string of dots on a line.
          const nx = -dy / (speed || 1);
          const ny = dx / (speed || 1);
          const spread = (Math.random() - 0.5) * Math.min(26, speed * 0.5);
          d.x = pointer.px + dx * t + nx * spread;
          d.y = pointer.py + dy * t + ny * spread;
          d.vx = dx * (10 + Math.random() * 8) + nx * spread * 1.4;
          d.vy = dy * (10 + Math.random() * 8) + ny * spread * 1.4;
          d.life = 1;
          d.decay = 0.75 + Math.random() * 0.5;
          d.radius = 26 + Math.random() * 46 + Math.min(60, speed * 0.7);
        }
      }
      pointer.px = pointer.x;
      pointer.py = pointer.y;

      // --- Advect + paint -------------------------------------------------
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const d of drops) {
        if (d.life <= 0) continue;
        d.life -= d.decay * dt;
        if (d.life <= 0) continue;
        // Drag: the trail slows and settles instead of flying off.
        const drag = Math.pow(0.0022, dt);
        d.vx *= drag;
        d.vy *= drag;
        d.x += d.vx * dt;
        d.y += d.vy * dt;

        // Ease-out on life so drops fade gently at the end of their run.
        const a = d.life * d.life * 0.15;
        const r = d.radius * (1.25 - d.life * 0.25);
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
        g.addColorStop(0, `rgba(148, 226, 213, ${a})`);
        g.addColorStop(0.5, `rgba(94, 234, 212, ${a * 0.32})`);
        g.addColorStop(1, "rgba(94, 234, 212, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, compact]);

  if (reducedMotion || compact) return null;

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}

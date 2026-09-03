import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if device is touch-only
    if (window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches) {
      setIsTouchDevice(true);
      return;
    }

    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // First move initialization: snap both instantly to cursor position
      if (!isVisible || ringPos.current.x === -100) {
        ringPos.current = { x: e.clientX, y: e.clientY };
        mousePos.current = { x: e.clientX, y: e.clientY };
        setIsVisible(true);
      } else {
        mousePos.current = { x: e.clientX, y: e.clientY };
      }

      // Check if hovering interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('label') ||
          target.closest('[role="button"]') ||
          target.closest('.cursor-pointer') ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'LABEL'
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth physics loop: ring tightly tracks dot to remain perfectly concentric
    const renderLoop = () => {
      // Immediate 1:1 position for center dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Elastic trailing physics for outer ring (0.35 rate, no CSS transition delay on transform)
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.35;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.35;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
      {/* ── Outer Concentric Ring (Matches reference image) ── */}
      <div
        ref={ringRef}
        style={{
          transition: 'width 0.2s ease-out, height 0.2s ease-out, border-color 0.2s ease-out, background-color 0.2s ease-out, box-shadow 0.2s ease-out, opacity 0.15s ease-out',
        }}
        className={`pointer-events-none fixed top-0 left-0 rounded-full will-change-transform ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${
          isHovered
            ? 'h-11 w-11 border-[1.5px] border-accent-cyan/80 bg-accent-cyan/[0.08] shadow-[0_0_12px_rgba(0,210,255,0.35)]'
            : isPressed
            ? 'h-6 w-6 border-[1.5px] border-white/80 bg-white/10'
            : 'h-8 w-8 border border-white/50 bg-white/[0.02] shadow-[0_0_8px_rgba(255,255,255,0.15)]'
        }`}
      />

      {/* ── Solid Center Pointer Dot (Concentric white dot) ── */}
      <div
        ref={dotRef}
        style={{
          transition: 'opacity 0.15s ease-out, background-color 0.15s ease-out, box-shadow 0.15s ease-out',
        }}
        className={`pointer-events-none fixed top-0 left-0 rounded-full will-change-transform ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${
          isHovered
            ? 'h-2 w-2 bg-accent-cyan shadow-[0_0_8px_#00d2ff]'
            : 'h-2 w-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.95)]'
        }`}
      />
    </div>,
    document.body
  );
};

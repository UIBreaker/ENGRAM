/**
 * lib/animations.ts
 * Shared Framer Motion variants for the entire ENGRAM app.
 * Import these in any page to get consistent, smooth animations.
 */
import { Variants, Transition } from "framer-motion";

// ── Easing Curves ──────────────────────────────────────────
export const ease = {
  smooth: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  spring: { type: "spring", stiffness: 400, damping: 30 } as Transition,
  springSnappy: { type: "spring", stiffness: 600, damping: 35 } as Transition,
  bounce: { type: "spring", stiffness: 500, damping: 20 } as Transition,
};

// ── Page Transitions ──────────────────────────────────────
export const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.28, ease: ease.smooth },
  },
  exit:    {
    opacity: 0, y: -8,
    transition: { duration: 0.16, ease: "easeIn" },
  },
};

// ── Card / Item Entrance (used in stagger containers) ─────
export const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.3, ease: ease.smooth },
  },
};

// ── Stagger Container ─────────────────────────────────────
export const containerVariants: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
};

// ── Slide In from Left (Sidebar, drawers) ─────────────────
export const slideLeftVariants: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.25, ease: ease.smooth },
  },
};

// ── Slide Up (FAB, toasts, bottom sheets) ─────────────────
export const slideUpVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: ease.smooth },
  },
  exit:    { opacity: 0, y: 20, transition: { duration: 0.18, ease: "easeIn" } },
};

// ── Scale Pop (badges, tooltips, modals) ──────────────────
export const popVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1, scale: 1,
    transition: ease.bounce,
  },
  exit:    { opacity: 0, scale: 0.9, transition: { duration: 0.12 } },
};

// ── Fade Only ─────────────────────────────────────────────
export const fadeVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.14 } },
};

// ── Hero Banner (bounce down from top) ───────────────────
export const heroVariants: Variants = {
  hidden:  { opacity: 0, y: -16, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, ease: ease.smooth },
  },
};

// ── Number counter helper (used with useMotionValue + animate) ──
export function getCounterTransition(delay = 0): Transition {
  return {
    duration: 0.9,
    ease: ease.smooth,
    delay,
  };
}

// ── Hover lift helper (for cards) ────────────────────────
export const cardHoverStyle = {
  idle: {
    transform: "translate(0px, 0px)",
    boxShadow: "var(--neo-shadow)",
    transition: "transform 0.08s ease, box-shadow 0.08s ease",
  },
  hover: {
    transform: "translate(-2px, -2px)",
    boxShadow: "var(--neo-shadow-lg)",
  },
};

import { motion } from "framer-motion";
import type { SwipeDirection } from "../types";

interface Props {
  onAction: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

const btnVariants = {
  rest: { scale: 1 },
  tap: { scale: 0.86 },
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-6 h-6">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

interface ButtonConfig {
  direction: SwipeDirection;
  icon: React.ReactNode;
  label: string;
  size: string;
  color: string;
  bg: string;
  border: string;
  shadow: string;
  ring: string;
}

const BUTTONS: ButtonConfig[] = [
  {
    direction: "left",
    icon: <XIcon />,
    label: "Skip",
    size: "w-14 h-14",
    color: "text-red-400",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
    shadow: "0 4px 24px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
    ring: "rgba(239,68,68,0.28)",
  },
  {
    direction: "up",
    icon: <BookmarkIcon />,
    label: "Save",
    size: "w-16 h-16",
    color: "text-indigo-400",
    bg: "rgba(99,102,241,0.14)",
    border: "rgba(129,140,248,0.42)",
    shadow: "0 4px 28px rgba(99,102,241,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
    ring: "rgba(99,102,241,0.32)",
  },
  {
    direction: "right",
    icon: <HeartIcon />,
    label: "Like",
    size: "w-14 h-14",
    color: "text-emerald-400",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.35)",
    shadow: "0 4px 24px rgba(52,211,153,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
    ring: "rgba(52,211,153,0.28)",
  },
];

export function ActionButtons({ onAction, disabled }: Props) {
  return (
    <div className="flex items-center justify-center gap-5 pb-6 pt-2">
      {BUTTONS.map(({ direction, icon, label, size, color, bg, border, shadow, ring }) => (
        <motion.button
          key={direction}
          variants={btnVariants}
          initial="rest"
          whileTap={disabled ? undefined : "tap"}
          onClick={() => !disabled && onAction(direction)}
          disabled={disabled}
          aria-label={label}
          className={`relative flex items-center justify-center ${size} ${color} rounded-full disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none group`}
          style={{
            background: bg,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1.5px solid ${border}`,
            boxShadow: shadow,
          }}
        >
          {icon}
          <span
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ boxShadow: `0 0 0 3px ${ring}` }}
          />
        </motion.button>
      ))}
    </div>
  );
}

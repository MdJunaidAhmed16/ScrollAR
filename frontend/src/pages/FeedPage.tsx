import { useRef } from "react";
import { CardStack } from "../components/CardStack";
import { ActionButtons } from "../components/ActionButtons";
import type { SwipeDirection } from "../types";

export function FeedPage() {
  const triggerRef = useRef<((d: SwipeDirection) => void) | null>(null);

  return (
    <div className="flex flex-col items-center h-[calc(100vh-65px)] px-4 py-4">
      {/* Card + floating buttons container */}
      <div className="relative w-full max-w-sm flex-1 max-h-[680px]">
        {/* Card stack fills the container */}
        <div className="absolute inset-0 pb-24">
          <CardStack onButtonsReady={(fn) => { triggerRef.current = fn; }} />
        </div>

        {/* Buttons float at the bottom, over the card */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 rounded-b-3xl pt-6 pb-4"
          style={{
            background: "linear-gradient(to top, rgba(14,14,26,0.92) 60%, transparent)",
          }}
        >
          <ActionButtons onAction={(direction) => triggerRef.current?.(direction)} />
        </div>
      </div>
    </div>
  );
}

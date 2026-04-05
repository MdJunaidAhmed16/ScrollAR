import { useRef } from "react";
import { CardStack } from "../components/CardStack";
import { ActionButtons } from "../components/ActionButtons";
import type { SwipeDirection } from "../types";

export function FeedPage() {
  const triggerRef = useRef<((d: SwipeDirection) => void) | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 min-h-0">
        <div className="relative w-full max-w-sm h-full max-h-[620px]">
          <CardStack
            onButtonsReady={(fn) => { triggerRef.current = fn; }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons
        onAction={(direction) => triggerRef.current?.(direction)}
      />
    </div>
  );
}

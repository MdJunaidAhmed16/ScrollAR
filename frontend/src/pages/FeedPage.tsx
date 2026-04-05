import { useSwipeMutation } from "../hooks/useFeed";
import { CardStack } from "../components/CardStack";

export function FeedPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* Card area — max-width keeps it Instagram-style on desktop */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-sm h-full max-h-[640px]">
          <CardStack />
        </div>
      </div>

      {/* Hint bar */}
      <div className="flex justify-center gap-8 pb-6 text-xs text-gray-600">
        <span>← Skip</span>
        <span>↑ Save</span>
        <span>→ Like</span>
      </div>
    </div>
  );
}

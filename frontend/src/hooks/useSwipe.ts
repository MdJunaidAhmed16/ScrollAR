import { useMotionValue, useTransform } from "framer-motion";
import type { SwipeDirection } from "../types";

const SWIPE_THRESHOLD = 120;   // px offset to trigger swipe
const VELOCITY_THRESHOLD = 600; // px/s

interface UseSwipeOptions {
  onSwipe: (direction: SwipeDirection) => void;
}

export function useSwipe({ onSwipe }: UseSwipeOptions) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotate card slightly as it's dragged left/right
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);

  // Overlay opacities
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const saveOpacity = useTransform(y, [-SWIPE_THRESHOLD, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) {
    const { offset, velocity } = info;

    if (offset.y < -SWIPE_THRESHOLD || velocity.y < -VELOCITY_THRESHOLD) {
      onSwipe("up");
      return;
    }
    if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      onSwipe("right");
      return;
    }
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      onSwipe("left");
      return;
    }
    // Snap back — framer motion handles this via dragElastic/dragConstraints
  }

  return { x, y, rotate, likeOpacity, nopeOpacity, saveOpacity, handleDragEnd };
}

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { CardContent } from "./CardContent";
import type { FeedItem, SwipeDirection } from "../types";

interface Props {
  item: FeedItem;
  onSwipe: (direction: SwipeDirection, paperId: string) => void;
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = second, 2 = third
  forcedSwipe?: SwipeDirection | null;
}

const EXIT_DISTANCE = 800;
const EXIT_TRANSITION = { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const };

export function SwipeCard({ item, onSwipe, isTop, stackIndex, forcedSwipe }: Props) {
  const controls = useAnimation();
  const isSwiping = useRef(false);

  useEffect(() => {
    if (!forcedSwipe || !isTop || isSwiping.current) return;
    isSwiping.current = true;
    const exitX = forcedSwipe === "right" ? EXIT_DISTANCE : forcedSwipe === "left" ? -EXIT_DISTANCE : 0;
    const exitY = forcedSwipe === "up" ? -EXIT_DISTANCE : 0;
    const exitRotate = forcedSwipe === "right" ? 30 : forcedSwipe === "left" ? -30 : 0;
    controls
      .start({ x: exitX, y: exitY, rotate: exitRotate, opacity: 0, transition: EXIT_TRANSITION })
      .then(() => onSwipe(forcedSwipe, item.paper.id));
  }, [forcedSwipe]); // eslint-disable-line react-hooks/exhaustive-deps

  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 12;

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl overflow-hidden"
      style={{
        y: isTop ? 0 : yOffset,
        scale,
        zIndex: 10 - stackIndex,
        background: "linear-gradient(135deg, #1e1e2e 0%, #16162a 100%)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}
      animate={isTop ? controls : undefined}
    >
      <CardContent item={item} />
    </motion.div>
  );
}

import { motion, useAnimation } from "framer-motion";
import { useRef } from "react";
import { useSwipe } from "../hooks/useSwipe";
import { CardContent } from "./CardContent";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { SwipeOverlay } from "./SwipeOverlay";
import type { FeedItem, SwipeDirection } from "../types";

interface Props {
  item: FeedItem;
  onSwipe: (direction: SwipeDirection, paperId: string) => void;
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = second, 2 = third
}

const EXIT_DISTANCE = 800;
const EXIT_TRANSITION = { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const };

export function SwipeCard({ item, onSwipe, isTop, stackIndex }: Props) {
  const controls = useAnimation();
  const isSwiping = useRef(false);

  const { x, y, rotate, likeOpacity, nopeOpacity, saveOpacity, handleDragEnd } =
    useSwipe({
      onSwipe: (direction) => {
        if (isSwiping.current) return;
        isSwiping.current = true;

        const exitX = direction === "right" ? EXIT_DISTANCE : direction === "left" ? -EXIT_DISTANCE : 0;
        const exitY = direction === "up" ? -EXIT_DISTANCE : 0;
        const exitRotate = direction === "right" ? 30 : direction === "left" ? -30 : 0;

        controls.start({
          x: exitX,
          y: exitY,
          rotate: exitRotate,
          opacity: 0,
          transition: EXIT_TRANSITION,
        }).then(() => {
          onSwipe(direction, item.paper.id);
        });
      },
    });

  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 12;

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : yOffset,
        rotate: isTop ? rotate : 0,
        scale,
        zIndex: 10 - stackIndex,
        background: "linear-gradient(135deg, #1e1e2e 0%, #16162a 100%)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}
      animate={isTop ? controls : undefined}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      dragMomentum={false}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileTap={isTop ? { scale: 0.98 } : undefined}
    >
      {isTop && (
        <>
          <SwipeOverlay
            likeOpacity={likeOpacity}
            nopeOpacity={nopeOpacity}
            saveOpacity={saveOpacity}
          />
          <OnboardingOverlay />
        </>
      )}
      <CardContent item={item} />
    </motion.div>
  );
}

import { motion, MotionValue } from "framer-motion";

interface Props {
  likeOpacity: MotionValue<number>;
  nopeOpacity: MotionValue<number>;
  saveOpacity: MotionValue<number>;
}

export function SwipeOverlay({ likeOpacity, nopeOpacity, saveOpacity }: Props) {
  return (
    <>
      {/* LIKE — right swipe */}
      <motion.div
        className="absolute top-8 left-6 rotate-[-20deg] border-4 border-green-400 text-green-400 font-black text-3xl px-3 py-1 rounded-lg pointer-events-none select-none"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>

      {/* NOPE — left swipe */}
      <motion.div
        className="absolute top-8 right-6 rotate-[20deg] border-4 border-red-400 text-red-400 font-black text-3xl px-3 py-1 rounded-lg pointer-events-none select-none"
        style={{ opacity: nopeOpacity }}
      >
        NOPE
      </motion.div>

      {/* SAVE — swipe up */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 border-4 border-blue-400 text-blue-400 font-black text-3xl px-3 py-1 rounded-lg pointer-events-none select-none"
        style={{ opacity: saveOpacity }}
      >
        SAVE
      </motion.div>
    </>
  );
}

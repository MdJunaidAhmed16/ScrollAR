import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const STEPS = [
  {
    icon: "👈",
    label: "Skip",
    description: "Not interested? Swipe left to skip the paper.",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
  {
    icon: "👉",
    label: "Like",
    description: "Find it interesting? Swipe right to like it.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  {
    icon: "👆",
    label: "Save",
    description: "Want to read later? Swipe up to bookmark it.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  {
    icon: "👇",
    label: "Expand",
    description: "Tap the card to read the full AI summary.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
];

const STORAGE_KEY = "scrollar_onboarded";

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Step indicators */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className={`flex flex-col items-center text-center px-8 border rounded-2xl p-6 mx-6 ${STEPS[step].bg}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-5xl mb-4">{STEPS[step].icon}</span>
              <span className={`text-xl font-bold mb-2 ${STEPS[step].color}`}>
                {STEPS[step].label}
              </span>
              <p className="text-gray-300 text-sm leading-relaxed">
                {STEPS[step].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step < STEPS.length - 1 ? (
              <>
                <button
                  onClick={dismiss}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Skip tutorial
                </button>
                <button
                  onClick={next}
                  className="px-6 py-2 text-sm font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Next →
                </button>
              </>
            ) : (
              <button
                onClick={dismiss}
                className="px-8 py-2 text-sm font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Let's go! 🚀
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

// Deterministic fake arXiv titles for the falling rain
const arxivTitles = [
  "Attention Is All You Need",
  "BERT: Pre-training of Deep Bidirectional Transformers",
  "Generative Adversarial Networks",
  "Deep Residual Learning for Image Recognition",
  "Playing Atari with Deep Reinforcement Learning",
  "Auto-Encoding Variational Bayes",
  "Dropout: Preventing Overfitting in Neural Networks",
  "ImageNet Classification with Deep CNNs",
  "Proximal Policy Optimization Algorithms",
  "Neural Machine Translation by Jointly Learning to Align",
  "Denoising Diffusion Probabilistic Models",
  "Language Models are Few-Shot Learners",
  "Segment Anything Model",
  "Llama: Open and Efficient Foundation Language Models",
  "Chain-of-Thought Prompting Elicits Reasoning",
  "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
  "LoRA: Low-Rank Adaptation of Large Language Models",
  "Constitutional AI: Harmlessness from AI Feedback",
  "Multimodal Few-Shot Learning with Frozen Language Models",
  "Flamingo: a Visual Language Model for Few-Shot Learning",
];

interface FallingTitleProps {
  title: string;
  x: number;
  speed: number;
  opacity: number;
  fontSize: number;
  frame: number;
  totalFrames: number;
}

const FallingTitle: React.FC<FallingTitleProps> = ({
  title, x, speed, opacity, fontSize, frame, totalFrames,
}) => {
  const yProgress = (frame * speed) % (totalFrames * 1.2);
  const y = interpolate(yProgress, [0, totalFrames * 1.2], [-100, 120], {
    extrapolateRight: "wrap",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        fontSize,
        color: `rgba(129,140,248,${opacity})`,
        fontFamily: "monospace",
        fontWeight: 400,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        transform: "translateX(-50%)",
      }}
    >
      {title}
    </div>
  );
};

// Slot-machine-style digit
const SlotDigit: React.FC<{ value: string; spinning: boolean; frame: number }> = ({
  value,
  spinning,
  frame,
}) => {
  const spinY = spinning ? -(frame * 4 % 240) : 0;
  return (
    <div
      style={{
        display: "inline-block",
        overflow: "hidden",
        height: "1.2em",
        verticalAlign: "bottom",
      }}
    >
      <div
        style={{
          transform: `translateY(${spinY}px)`,
          transition: spinning ? "none" : "transform 0.1s ease",
        }}
      >
        {spinning
          ? Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ height: "1.2em", lineHeight: "1.2em" }}>
                {i}
              </div>
            ))
          : value}
      </div>
    </div>
  );
};

export const Scene7Fomo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene 7: 13.0s → 16.0s = 3.0s = 180 frames

  // Counter animation: 0 → 800 over first ~90 frames (1.5s)
  const counterValue = Math.floor(
    interpolate(frame, [0, 90], [0, 800], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );
  const counterDone = frame >= 90;

  // "+" glow after counter stops
  const plusGlow = counterDone ? 0.5 + Math.sin((frame - 90) * 0.1) * 0.5 : 0;

  // Below text: "papers hit arXiv. Every. Single. Day." — types in word by word
  const words = ["papers", "hit", "arXiv.", "Every.", "Single.", "Day."];
  const wordDelay = 9; // frames per word
  const visibleWords = words.filter((_, i) => frame >= 95 + i * wordDelay);

  // Scene 7 pull-out: 105% → 100%
  const sceneScale = interpolate(frame, [0, 180], [1.05, 1.0], {
    extrapolateRight: "clamp",
  });

  // Final message: "You'll never miss a breakthrough again."
  // Clears at frame ~150 (2.5s), fades in at frame ~150
  const clearFrame = 150;
  const counterSectionOpacity = interpolate(frame, [clearFrame - 10, clearFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const finalOpacity = interpolate(frame, [clearFrame, clearFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Falling papers — deterministic positions
  const fallingPapers = arxivTitles.map((title, i) => ({
    title,
    x: 5 + (i * 4.7) % 90,
    speed: 0.4 + (i * 0.07) % 0.4,
    opacity: 0.05 + (i * 0.03) % 0.12,
    fontSize: 11 + (i % 4) * 2,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        background: "radial-gradient(ellipse at center, rgba(15,12,40,0.9) 0%, #000 80%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: `scale(${sceneScale})`,
        transformOrigin: "center center",
        position: "relative",
      }}
    >
      {/* Falling paper titles background */}
      {fallingPapers.map((p, i) => (
        <FallingTitle key={i} {...p} frame={frame} totalFrames={180} />
      ))}

      {/* Counter section */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          opacity: counterSectionOpacity,
        }}
      >
        {/* Counter */}
        <div
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 120,
            color: "#ffffff",
            lineHeight: 1,
            display: "flex",
            alignItems: "baseline",
          }}
        >
          <span>{counterDone ? "800" : counterValue}</span>
          <span
            style={{
              color: "#818cf8",
              fontSize: 100,
              textShadow: plusGlow > 0
                ? `0 0 ${20 * plusGlow}px rgba(129,140,248,${plusGlow})`
                : "none",
            }}
          >
            +
          </span>
        </div>

        {/* Sub-text */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 700,
          }}
        >
          {visibleWords.map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Arial', sans-serif",
                fontWeight: 500,
                fontSize: 32,
                color: "#64748b",
                animation: "fadeIn 0.15s ease",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Final message */}
      <div
        style={{
          position: "absolute",
          opacity: finalOpacity,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 56,
            color: "#ffffff",
          }}
        >
          You'll never miss a{" "}
        </span>
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 64,
            color: "#818cf8",
          }}
        >
          breakthrough
        </span>
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 56,
            color: "#ffffff",
          }}
        >
          {" "}again.
        </span>
      </div>
    </div>
  );
};

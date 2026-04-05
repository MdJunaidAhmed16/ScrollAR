import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface CalloutProps {
  label: string;
  side: "left" | "right";
  visible: boolean;
  frame: number;
  fps: number;
}

const Callout: React.FC<CalloutProps> = ({ label, side, visible, frame, fps }) => {
  const appear = spring({
    frame: visible ? frame : -100,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 250 },
  });

  const directionX = side === "left" ? -1 : 1;

  return (
    <div
      style={{
        position: "absolute",
        [side]: -180,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexDirection: side === "left" ? "row-reverse" : "row",
        opacity: appear,
        transform: `translateX(${(1 - appear) * directionX * 30}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(15,15,30,0.95)",
          border: "1.5px solid rgba(129,140,248,0.6)",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 18,
          color: "#e2e8f0",
          fontFamily: "'Arial', sans-serif",
          fontWeight: 600,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(99,102,241,0.2)",
        }}
      >
        {label}
      </div>
      {/* Connecting line */}
      <div
        style={{
          width: 40,
          height: 1.5,
          backgroundColor: "rgba(129,140,248,0.5)",
        }}
      />
    </div>
  );
};

// Simulated arXiv paper cards
const papers = [
  {
    title: "Attention Is All You Need",
    summary: "Transformer architecture revolutionizes sequence-to-sequence tasks using self-attention mechanisms without recurrence or convolutions.",
    tags: ["#NLP", "#Transformers", "#DeepLearning"],
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
  },
  {
    title: "Diffusion Models Beat GANs on Image Synthesis",
    summary: "Score-based generative models achieve state-of-the-art image quality by gradually denoising Gaussian noise into high-fidelity images.",
    tags: ["#ComputerVision", "#Generative", "#AI"],
    bg: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  },
  {
    title: "Scaling Laws for Neural Language Models",
    summary: "Performance of language models follows predictable power-law scaling with compute, data, and parameter count.",
    tags: ["#LLM", "#Scaling", "#NLP"],
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  },
];

export const Scene5Product: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene 5: 6.5s → 10.0s = 3.5s = 210 frames locally

  // Phone slides up from bottom
  const phoneY = spring({
    frame,
    fps,
    from: 400,
    to: 0,
    config: { damping: 12, stiffness: 180, mass: 1 },
  });

  // Slow push-in: 100% → 103%
  const sceneScale = interpolate(frame, [0, 210], [1, 1.03], {
    extrapolateRight: "clamp",
  });

  // Card index — scrolls through naturally
  // Each card shown for ~60 frames (1s), with a 10-frame scroll transition
  const cardProgress = interpolate(frame, [30, 90, 100, 160, 170, 210], [0, 0, 1, 1, 2, 2], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const cardIndex = Math.floor(cardProgress);
  const cardTransition = cardProgress - cardIndex;

  // Callout timing (relative to scene start)
  // "AI Summary" at 7.5s → scene local 1.0s → frame 60
  const callout1Visible = frame >= 60;
  const callout1Frame = Math.max(0, frame - 60);

  // "#topics" at 8.5s → scene local 2.0s → frame 120
  const callout2Visible = frame >= 120;
  const callout2Frame = Math.max(0, frame - 120);

  // "30 sec" at 9.0s → scene local 2.5s → frame 150
  const callout3Visible = frame >= 150;
  const callout3Frame = Math.max(0, frame - 150);

  const currentCard = papers[Math.min(cardIndex, papers.length - 1)];
  const nextCard = papers[Math.min(cardIndex + 1, papers.length - 1)];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        background: "radial-gradient(ellipse at center, rgba(30,20,80,0.5) 0%, #000 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: `scale(${sceneScale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Phone container with callouts */}
      <div
        style={{
          position: "relative",
          transform: `translateY(${phoneY}px)`,
        }}
      >
        {/* Callout 1: AI Summary — left */}
        <div style={{ position: "absolute", top: 160, left: 0, zIndex: 20 }}>
          <Callout
            label="🔬 AI Summary"
            side="left"
            visible={callout1Visible}
            frame={callout1Frame}
            fps={fps}
          />
        </div>

        {/* Callout 2: #topics — right */}
        <div style={{ position: "absolute", top: 310, right: 0, zIndex: 20 }}>
          <Callout
            label="#topics"
            side="right"
            visible={callout2Visible}
            frame={callout2Frame}
            fps={fps}
          />
        </div>

        {/* Callout 3: 30 sec — left */}
        <div style={{ position: "absolute", top: 400, left: 0, zIndex: 20 }}>
          <Callout
            label="⚡ 30 sec per paper"
            side="left"
            visible={callout3Visible}
            frame={callout3Frame}
            fps={fps}
          />
        </div>

        {/* iPhone Frame */}
        <div
          style={{
            width: 300,
            height: 600,
            borderRadius: 48,
            background: "linear-gradient(145deg, #2a2a2a, #111)",
            boxShadow: "0 0 0 2px #444, 0 60px 100px rgba(0,0,0,0.9), 0 0 60px rgba(99,102,241,0.15)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Screen */}
          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: 40,
              background: "#0a0a14",
              overflow: "hidden",
            }}
          >
            {/* App header */}
            <div
              style={{
                padding: "20px 20px 12px",
                borderBottom: "1px solid rgba(129,140,248,0.1)",
                background: "rgba(15,15,30,0.9)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#818cf8", fontFamily: "'Arial Black'", fontWeight: 900, fontSize: 22 }}>
                  Scroll<span style={{ color: "#fff" }}>Ar</span>
                </span>
                <span style={{ color: "#64748b", fontSize: 18 }}>📚</span>
              </div>
            </div>

            {/* Card area — sliding transition */}
            <div style={{ position: "relative", height: 460, overflow: "hidden" }}>
              {/* Current card */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translateY(${-cardTransition * 100}%)`,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    background: currentCard.bg,
                    borderRadius: 16,
                    padding: 16,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    border: "1px solid rgba(129,140,248,0.2)",
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>
                    arXiv • CS.AI
                  </div>
                  <div
                    style={{
                      color: "#f1f5f9",
                      fontFamily: "'Arial', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1.3,
                    }}
                  >
                    {currentCard.title}
                  </div>
                  <div
                    style={{
                      color: "#94a3b8",
                      fontFamily: "'Arial', sans-serif",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {currentCard.summary}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                    {currentCard.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: "rgba(129,140,248,0.15)",
                          color: "#818cf8",
                          borderRadius: 10,
                          padding: "3px 8px",
                          fontSize: 11,
                          fontFamily: "monospace",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Like/Dislike buttons */}
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "rgba(239,68,68,0.2)",
                        border: "1px solid rgba(239,68,68,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ef4444",
                        fontSize: 18,
                      }}
                    >
                      ✕
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "rgba(129,140,248,0.2)",
                        border: "1px solid rgba(129,140,248,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#818cf8",
                        fontSize: 18,
                      }}
                    >
                      ♥
                    </div>
                  </div>
                </div>
              </div>

              {/* Next card (slides in from below during transition) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translateY(${(1 - cardTransition) * 100}%)`,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    background: nextCard.bg,
                    borderRadius: 16,
                    padding: 16,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    border: "1px solid rgba(129,140,248,0.2)",
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>
                    arXiv • CS.LG
                  </div>
                  <div
                    style={{
                      color: "#f1f5f9",
                      fontFamily: "'Arial', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1.3,
                    }}
                  >
                    {nextCard.title}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                    {nextCard.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: "rgba(129,140,248,0.15)",
                          color: "#818cf8",
                          borderRadius: 10,
                          padding: "3px 8px",
                          fontSize: 11,
                          fontFamily: "monospace",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notch */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 90,
              height: 24,
              backgroundColor: "#000",
              borderRadius: 12,
              zIndex: 10,
            }}
          />
        </div>

        {/* Drop shadow glow */}
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 40,
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)",
            filter: "blur(10px)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

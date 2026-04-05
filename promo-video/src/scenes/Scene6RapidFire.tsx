import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface CutProps {
  label: string;
  number: string;
  color: string;
  screenshotBg: string;
  screenshotContent: React.ReactNode;
  frame: number;
  fps: number;
}

const CutSlide: React.FC<CutProps> = ({
  label,
  number,
  color,
  screenshotBg,
  screenshotContent,
  frame,
  fps,
}) => {
  // Zoom: 100% → 110% over 60 frames
  const zoom = interpolate(frame, [0, 60], [1, 1.1], { extrapolateRight: "clamp" });

  // Label slams from bottom
  const labelY = spring({
    frame,
    fps,
    from: 200,
    to: 0,
    config: { damping: 14, stiffness: 300 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: screenshotBg,
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {screenshotContent}

      {/* Number — top right */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          fontFamily: "'Courier New', monospace",
          fontSize: 28,
          color: "rgba(100,116,139,0.6)",
          fontWeight: 700,
        }}
      >
        {number}
      </div>

      {/* Label slams from bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${labelY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 120,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "-4px",
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// Mock screenshot contents
const SignupScreen = () => (
  <div
    style={{
      width: 700,
      height: 500,
      background: "linear-gradient(135deg, #0c0a1a 0%, #1e1b4b 100%)",
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: 40,
      border: "1px solid rgba(129,140,248,0.2)",
    }}
  >
    <div style={{ color: "#fff", fontFamily: "'Arial Black'", fontSize: 40, fontWeight: 900 }}>
      Scroll<span style={{ color: "#818cf8" }}>Ar</span>
    </div>
    <div style={{ color: "#94a3b8", fontSize: 20, fontFamily: "Arial" }}>
      doom scroll, but make it science
    </div>
    <div
      style={{
        width: "100%",
        height: 52,
        borderRadius: 26,
        backgroundColor: "#6366f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: 700,
        marginTop: 10,
      }}
    >
      Sign up free →
    </div>
    <div
      style={{
        width: "100%",
        height: 52,
        borderRadius: 26,
        border: "1.5px solid rgba(129,140,248,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#818cf8",
        fontSize: 20,
        fontFamily: "Arial",
      }}
    >
      Log in
    </div>
  </div>
);

const DiscoverScreen = () => (
  <div
    style={{
      width: 700,
      height: 500,
      background: "linear-gradient(135deg, #0a0a14 0%, #1e3a5f 100%)",
      borderRadius: 16,
      padding: 32,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      border: "1px solid rgba(129,140,248,0.2)",
    }}
  >
    <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13 }}>arXiv • CS.AI • 2024</div>
    <div style={{ color: "#f1f5f9", fontFamily: "'Arial Black'", fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
      Large Language Models as Zero-Shot Reasoners
    </div>
    <div style={{ color: "#94a3b8", fontFamily: "Arial", fontSize: 15, lineHeight: 1.6 }}>
      We show that chain-of-thought prompting is an emergent property of sufficiently scaled language models,
      enabling complex reasoning without fine-tuning.
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      {["#LLM", "#Reasoning", "#ZeroShot"].map(t => (
        <span key={t} style={{ backgroundColor: "rgba(129,140,248,0.15)", color: "#818cf8", borderRadius: 10, padding: "4px 10px", fontSize: 13, fontFamily: "monospace" }}>{t}</span>
      ))}
    </div>
    <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
      <div style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 22 }}>✕</div>
      <div style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8", fontSize: 22 }}>♥</div>
    </div>
  </div>
);

const SavedScreen = () => (
  <div
    style={{
      width: 700,
      height: 500,
      background: "linear-gradient(135deg, #0c0a1a 0%, #1a1040 100%)",
      borderRadius: 16,
      padding: 32,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      border: "1px solid rgba(129,140,248,0.2)",
    }}
  >
    <div style={{ color: "#f1f5f9", fontFamily: "'Arial Black'", fontSize: 22, fontWeight: 700 }}>Saved Papers</div>
    {[
      "Attention Is All You Need",
      "GPT-4 Technical Report",
      "Scaling Laws for LLMs",
      "Neural Radiance Fields",
    ].map((title, i) => (
      <div
        key={i}
        style={{
          padding: "12px 16px",
          backgroundColor: "rgba(129,140,248,0.08)",
          borderRadius: 10,
          border: "1px solid rgba(129,140,248,0.15)",
          color: "#e2e8f0",
          fontFamily: "Arial",
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{title}</span>
        <span style={{ color: "#818cf8" }}>♥</span>
      </div>
    ))}
  </div>
);

export const Scene6RapidFire: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene 6: 10.0s → 13.0s = 3.0s = 180 frames
  // 3 cuts of 1s each = 60 frames each, with 1-frame white flash between

  // Which cut are we in?
  const cut = Math.min(Math.floor(frame / 61), 2);
  const cutFrame = frame % 61;

  // White flash between cuts
  const flash1 = interpolate(frame, [59, 60, 62], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash2 = interpolate(frame, [120, 121, 123], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flashOpacity = Math.max(flash1, flash2);

  const cuts = [
    { label: "JOIN", number: "01", bg: "#0c0a1a", content: <SignupScreen /> },
    { label: "DISCOVER", number: "02", bg: "#0a0a14", content: <DiscoverScreen /> },
    { label: "COLLECT", number: "03", bg: "#0c0a1a", content: <SavedScreen /> },
  ];

  const current = cuts[cut];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <CutSlide
        label={current.label}
        number={current.number}
        color="#fff"
        screenshotBg={current.bg}
        screenshotContent={current.content}
        frame={cutFrame}
        fps={fps}
      />

      {/* Flash overlay */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#ffffff",
            opacity: flashOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

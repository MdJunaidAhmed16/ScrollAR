import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Typewriter hook
const useTypewriter = (text: string, startFrame: number, charsPerSecond: number, fps: number, frame: number) => {
  const elapsed = Math.max(0, frame - startFrame);
  const charsVisible = Math.floor((elapsed / fps) * charsPerSecond);
  return text.slice(0, charsVisible);
};

export const Scene3Flip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene 3: 3.5s → 5.0s = 1.5s = 90 frames locally

  // Slow push-in: 100% → 108%
  const scale = interpolate(frame, [0, 90], [1, 1.08], { extrapolateRight: "clamp" });

  // Typewriter for line 1 — "What if scrolling" — starts immediately, 20 chars/sec
  const typedLine1 = useTypewriter("What if scrolling", 0, 20, fps, frame);
  const cursorBlink = Math.floor(frame / 8) % 2 === 0; // blink every 8 frames

  // Line 1 is "done" once all chars appear (~0.85s = 51 frames)
  const line1Done = frame >= 51;

  // "made you smarter?" explodes in at frame 57 (line1 done + 0.1s beat)
  const slamScale = spring({
    frame: Math.max(0, frame - 57),
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 300, mass: 0.8 },
  });

  // Particle burst opacity — brief flash on slam
  const particleOpacity = interpolate(frame, [57, 65, 80], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse after slam
  const glowIntensity = interpolate(frame, [70, 85, 90], [0, 1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background warms from cold to indigo
  const bgR = interpolate(frame, [0, 90], [10, 15], { extrapolateRight: "clamp" });
  const bgG = interpolate(frame, [0, 90], [15, 12], { extrapolateRight: "clamp" });
  const bgB = interpolate(frame, [0, 90], [40, 60], { extrapolateRight: "clamp" });

  // Generate particle positions (deterministic)
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 80 + (i % 5) * 30;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 4 + (i % 3) * 3,
    };
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: `rgb(${bgR},${bgG},${bgB})`,
        background: `radial-gradient(ellipse at center, rgba(30,25,80,0.8) 0%, rgb(${bgR},${bgG},${bgB}) 80%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Line 1: Typewriter */}
      <div
        style={{
          fontFamily: "'Courier New', 'Lucida Console', monospace",
          fontWeight: 700,
          fontSize: 60,
          color: "#e2e8f0",
          letterSpacing: "1px",
          marginBottom: 16,
          minHeight: 80,
          display: "flex",
          alignItems: "center",
        }}
      >
        {typedLine1}
        {/* Cursor blinks while typing, disappears after done */}
        {!line1Done && (
          <span
            style={{
              opacity: cursorBlink ? 1 : 0,
              color: "#818cf8",
              fontWeight: 400,
            }}
          >
            |
          </span>
        )}
      </div>

      {/* Line 2: "made you smarter?" — elastic slam */}
      <div style={{ position: "relative" }}>
        {/* Particle burst */}
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: "#818cf8",
              transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
              opacity: particleOpacity * (0.5 + (i % 3) * 0.25),
              pointerEvents: "none",
            }}
          />
        ))}

        <div
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 88,
            color: "#818cf8",
            textTransform: "uppercase",
            letterSpacing: "-3px",
            transform: `scale(${slamScale})`,
            display: "inline-block",
            textShadow: glowIntensity > 0
              ? `0 0 ${30 * glowIntensity}px rgba(129,140,248,${glowIntensity * 0.8}), 0 0 ${60 * glowIntensity}px rgba(129,140,248,${glowIntensity * 0.4})`
              : "none",
          }}
        >
          made you smarter?
        </div>
      </div>
    </div>
  );
};

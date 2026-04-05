import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

export const Scene2Slap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene local frame: Scene2 starts at 1.5s → offset = 90 frames
  // Duration: 1.5s → 3.5s = 2 seconds = 120 frames

  // "You scroll" — punches from left at frame 0, overshoot bounce
  const scrollX = spring({
    frame,
    fps,
    from: -800,
    to: 0,
    config: { damping: 14, stiffness: 200, mass: 1 },
  });

  // "for 2 hours." — punches from right at frame 8
  const hoursX = spring({
    frame: Math.max(0, frame - 8),
    fps,
    from: 800,
    to: 0,
    config: { damping: 14, stiffness: 200, mass: 1 },
  });

  // Camera shake on "You scroll" slam
  const shake1 = frame >= 0 && frame < 6
    ? Math.sin(frame * 8) * 2
    : 0;

  // Camera shake on "for 2 hours." slam
  const shake2 = frame >= 8 && frame < 14
    ? Math.sin((frame - 8) * 8) * 2
    : 0;

  // Camera shake on "nothing" land
  const shake3 = frame >= 50 && frame < 56
    ? Math.sin((frame - 50) * 8) * 2
    : 0;

  const shakeX = shake1 + shake2 + shake3;

  // "You learn nothing." — fades up slowly at ~frame 50 (0.8s after scene start)
  const nothingOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nothingScale = interpolate(frame, [50, 70], [0.95, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(ellipse at center, #0d1527 0%, #000000 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: `translateX(${shakeX}px)`,
      }}
    >
      {/* Spotlight radial glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(15,25,80,0.6) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Line 1: "You scroll" + "for 2 hours." */}
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "baseline",
          marginBottom: 20,
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "0 40px",
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#ffffff",
            transform: `translateX(${scrollX}px)`,
            display: "inline-block",
            textTransform: "uppercase",
            letterSpacing: "-2px",
          }}
        >
          You scroll
        </span>
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#ffffff",
            transform: `translateX(${hoursX}px)`,
            display: "inline-block",
            textTransform: "uppercase",
            letterSpacing: "-2px",
          }}
        >
          for 2 hours.
        </span>
      </div>

      {/* Line 2: "You learn nothing." */}
      <div
        style={{
          opacity: nothingOpacity,
          transform: `scale(${nothingScale})`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            color: "#64748b",
            display: "inline",
            fontSize: 68,
            textTransform: "uppercase",
            letterSpacing: "-2px",
          }}
        >
          You learn{" "}
        </span>
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            color: "#64748b",
            display: "inline",
            fontSize: 80,
            textTransform: "uppercase",
            letterSpacing: "-2px",
          }}
        >
          nothing.
        </span>
      </div>
    </div>
  );
};

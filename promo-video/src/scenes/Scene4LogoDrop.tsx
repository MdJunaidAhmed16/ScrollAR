import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const Scene4LogoDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene 4: 5.0s → 6.5s = 1.5s = 90 frames locally

  // Logo slams in — starts huge+blurred, snaps to final in 4 frames
  const logoScale = frame < 4
    ? interpolate(frame, [0, 4], [3, 1], { extrapolateRight: "clamp" })
    : spring({
        frame: frame - 4,
        fps,
        from: 1,
        to: 1,
        config: { damping: 12, stiffness: 400 },
      });

  const logoBlur = interpolate(frame, [0, 4], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Scale bounce: 100% → 102% → 100%
  const settleBounce = spring({
    frame: Math.max(0, frame - 4),
    fps,
    from: 1.02,
    to: 1,
    config: { damping: 8, stiffness: 300, mass: 0.5 },
  });

  // White flash on impact (frames 3-5)
  const flashOpacity = interpolate(frame, [3, 4, 7], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shockwave ripple — expands outward from frame 4
  const rippleScale = interpolate(frame, [4, 40], [0, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleOpacity = interpolate(frame, [4, 20, 40], [0.8, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Ar" glow breathing pulse
  const arGlow = 0.5 + Math.sin(frame * 0.15) * 0.5;

  // Tagline: fades up + letter-spacing animates wide→normal, starts at frame ~18
  const taglineOpacity = interpolate(frame, [18, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineLetterSpacing = interpolate(frame, [18, 50], [24, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0c0a1a",
        background: "radial-gradient(ellipse at center, #1a1040 0%, #0c0a1a 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Indigo radial glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Shockwave ripple */}
      {rippleOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "3px solid rgba(129,140,248,0.6)",
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale * settleBounce})`,
          filter: logoBlur > 0 ? `blur(${logoBlur}px)` : "none",
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 96,
            color: "#ffffff",
            letterSpacing: "-3px",
          }}
        >
          Scroll
        </span>
        <span
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 96,
            color: "#818cf8",
            letterSpacing: "-3px",
            textShadow: `0 0 ${20 * arGlow}px rgba(129,140,248,${0.6 * arGlow}), 0 0 ${50 * arGlow}px rgba(129,140,248,${0.3 * arGlow})`,
          }}
        >
          Ar
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          letterSpacing: taglineLetterSpacing,
          fontFamily: "'Arial', sans-serif",
          fontWeight: 300,
          fontSize: 22,
          color: "#64748b",
          marginTop: 16,
          textTransform: "lowercase",
        }}
      >
        doom scroll, but make it science
      </div>

      {/* White flash */}
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

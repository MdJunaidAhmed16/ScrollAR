import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export const Scene8Closer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene 8: 16.0s → 20.0s = 4.0s = 240 frames

  // Logo fades in at frame 0, 0.5s = 30 frames
  const logoOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Tagline slides up at frame 49 (0.8s → 48 frames)
  const taglineY = interpolate(frame, [48, 72], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const taglineOpacity = interpolate(frame, [48, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA button materializes at frame 105 (1.75s)
  const ctaOpacity = interpolate(frame, [105, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaBlur = interpolate(frame, [105, 135], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // CTA pulse
  const ctaPulse = 1 + Math.sin(frame * 0.08) * 0.03;

  // URL fades in at frame 120 (2.0s)
  const urlOpacity = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Ar" glow breathing
  const arGlow = 0.5 + Math.sin(frame * 0.1) * 0.5;

  // Aurora gradient shift — very subtle, slow-moving
  const auroraShift = (frame / 240) * 360;

  // Fade to black over last 30 frames (0.5s)
  const fadeToBlack = interpolate(frame, [210, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Aurora background — subtle, slow gradient movement */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at ${50 + Math.sin(auroraShift * 0.017) * 20}% ${50 + Math.cos(auroraShift * 0.013) * 15}%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at ${50 + Math.cos(auroraShift * 0.019) * 25}% ${50 + Math.sin(auroraShift * 0.011) * 20}%, rgba(139,92,246,0.08) 0%, transparent 55%),
            radial-gradient(ellipse at ${50 + Math.sin(auroraShift * 0.015) * 15}% ${50 + Math.cos(auroraShift * 0.017) * 25}%, rgba(29,78,216,0.1) 0%, transparent 60%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Content stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            display: "flex",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              fontWeight: 900,
              fontSize: 100,
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
              fontSize: 100,
              color: "#818cf8",
              letterSpacing: "-3px",
              textShadow: `0 0 ${20 * arGlow}px rgba(129,140,248,${0.7 * arGlow}), 0 0 ${50 * arGlow}px rgba(129,140,248,${0.3 * arGlow})`,
            }}
          >
            Ar
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: "'Arial', sans-serif",
            fontWeight: 300,
            fontSize: 24,
            color: "#64748b",
            letterSpacing: 3,
            textTransform: "lowercase",
            marginBottom: 40,
          }}
        >
          doom scroll, but make it science
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: ctaOpacity,
            filter: ctaBlur > 0 ? `blur(${ctaBlur}px)` : "none",
            transform: `scale(${ctaPulse})`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#6366f1",
              borderRadius: 40,
              padding: "16px 48px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2)",
            }}
          >
            <span
              style={{
                fontFamily: "'Arial', sans-serif",
                fontWeight: 700,
                fontSize: 26,
                color: "#ffffff",
                letterSpacing: 0.5,
              }}
            >
              Try it free →
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: "'Courier New', 'JetBrains Mono', monospace",
            fontSize: 20,
            color: "#64748b",
            letterSpacing: 1,
          }}
        >
          scrollar.app
        </div>
      </div>

      {/* Fade to black */}
      {fadeToBlack > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000",
            opacity: fadeToBlack,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

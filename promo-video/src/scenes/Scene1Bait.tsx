import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export const Scene1Bait: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene runs 0 → 1.5s = 0 → 90 frames at 60fps
  const duration = 1.5 * fps;

  // Slow push-in zoom: 100% → 105%
  const scale = interpolate(frame, [0, duration], [1, 1.05], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  // Cold blue tint overlay opacity (constant)
  const blueOverlay = 0.25;

  // Chromatic aberration amount: ramps up slightly then a hard glitch near cut
  const aberration = interpolate(frame, [0, duration * 0.8, duration - 2], [2, 4, 10], {
    extrapolateRight: "clamp",
  });

  // White flash on the last 2 frames
  const flashOpacity = interpolate(frame, [duration - 2, duration - 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phone tilt: 5° right
  const phoneTilt = 5;

  // Meme cards — simulate doom-scroll by cycling colored cards
  const cardColors = [
    "#ff4757", "#ffa502", "#2ed573", "#1e90ff",
    "#ff6b81", "#eccc68", "#70a1ff", "#5352ed",
  ];
  const scrollSpeed = 0.6; // cards per second
  const cardIndexFloat = (frame / fps) * scrollSpeed * 8;
  const visibleCards = [0, 1, 2, 3].map((i) => {
    const cardIndex = (Math.floor(cardIndexFloat) + i) % cardColors.length;
    const offset = ((cardIndexFloat % 1) + i) * 160 - 160;
    return { color: cardColors[cardIndex], offset };
  });

  // Emoji labels to mimic social content
  const contentEmojis = ["🐱", "🍔", "💃", "😂", "🔥", "🎵", "👀", "✨"];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Phone mockup */}
      <div
        style={{
          transform: `rotate(${phoneTilt}deg)`,
          width: 280,
          height: 560,
          position: "relative",
        }}
      >
        {/* Phone outer frame */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 44,
            background: "linear-gradient(145deg, #2a2a2a, #111)",
            boxShadow: "0 0 0 2px #444, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px #333",
            overflow: "hidden",
          }}
        >
          {/* Screen area */}
          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: 36,
              backgroundColor: "#000",
              overflow: "hidden",
            }}
          >
            {/* Scrolling content cards */}
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {visibleCards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: card.offset,
                    left: 0,
                    right: 0,
                    height: 150,
                    backgroundColor: card.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 60,
                    borderRadius: 4,
                    margin: "0 2px",
                  }}
                >
                  {contentEmojis[(Math.floor(cardIndexFloat) + i) % contentEmojis.length]}
                </div>
              ))}

              {/* Progress bar (like TikTok) */}
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  right: 8,
                  height: 3,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    width: `${((frame / fps / 1.5) * 100) % 100}%`,
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>

            {/* Cold blue color tint */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#0033aa",
                opacity: blueOverlay,
                pointerEvents: "none",
                mixBlendMode: "multiply",
              }}
            />

            {/* Chromatic aberration simulation via pseudo-shadow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow: `inset ${aberration}px 0 0 rgba(255,0,0,0.15), inset -${aberration}px 0 0 rgba(0,255,255,0.15)`,
                pointerEvents: "none",
              }}
            />

            {/* Edge vignette for screen realism */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Notch */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 80,
              height: 22,
              backgroundColor: "#000",
              borderRadius: 11,
              zIndex: 10,
            }}
          />
        </div>

        {/* Ambient glow behind phone */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            background: "radial-gradient(ellipse at center, rgba(30,50,150,0.3) 0%, transparent 70%)",
            zIndex: -1,
            borderRadius: "50%",
          }}
        />
      </div>

      {/* White flash on cut */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#ffffff",
            opacity: flashOpacity,
          }}
        />
      )}
    </div>
  );
};

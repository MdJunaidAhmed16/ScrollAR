import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Scene1Bait } from "./scenes/Scene1Bait";
import { Scene2Slap } from "./scenes/Scene2Slap";
import { Scene3Flip } from "./scenes/Scene3Flip";
import { Scene4LogoDrop } from "./scenes/Scene4LogoDrop";
import { Scene5Product } from "./scenes/Scene5Product";
import { Scene6RapidFire } from "./scenes/Scene6RapidFire";
import { Scene7Fomo } from "./scenes/Scene7Fomo";
import { Scene8Closer } from "./scenes/Scene8Closer";

/**
 * ScrollAr 20-second viral promo video
 *
 * Timeline (at 60fps):
 *  Scene 1 — "The Bait"      0.0s –  1.5s  (frames   0 –  90)
 *  Scene 2 — "The Slap"      1.5s –  3.5s  (frames  90 – 210)
 *  Scene 3 — "The Flip"      3.5s –  5.0s  (frames 210 – 300)
 *  Scene 4 — "Logo Drop"     5.0s –  6.5s  (frames 300 – 390)
 *  Scene 5 — "The Product"   6.5s – 10.0s  (frames 390 – 600)
 *  Scene 6 — "Rapid Fire"   10.0s – 13.0s  (frames 600 – 780)
 *  Scene 7 — "The FOMO"     13.0s – 16.0s  (frames 780 – 960)
 *  Scene 8 — "The Closer"   16.0s – 20.0s  (frames 960 –1200)
 */
export const ScrollarPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  const s = (seconds: number) => Math.round(seconds * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Scene 1: 0.0 – 1.5s */}
      <Sequence from={s(0)} durationInFrames={s(1.5)}>
        <AbsoluteFill>
          <Scene1Bait />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: 1.5 – 3.5s */}
      <Sequence from={s(1.5)} durationInFrames={s(2)}>
        <AbsoluteFill>
          <Scene2Slap />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: 3.5 – 5.0s */}
      <Sequence from={s(3.5)} durationInFrames={s(1.5)}>
        <AbsoluteFill>
          <Scene3Flip />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: 5.0 – 6.5s */}
      <Sequence from={s(5.0)} durationInFrames={s(1.5)}>
        <AbsoluteFill>
          <Scene4LogoDrop />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: 6.5 – 10.0s */}
      <Sequence from={s(6.5)} durationInFrames={s(3.5)}>
        <AbsoluteFill>
          <Scene5Product />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: 10.0 – 13.0s */}
      <Sequence from={s(10.0)} durationInFrames={s(3.0)}>
        <AbsoluteFill>
          <Scene6RapidFire />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 7: 13.0 – 16.0s */}
      <Sequence from={s(13.0)} durationInFrames={s(3.0)}>
        <AbsoluteFill>
          <Scene7Fomo />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 8: 16.0 – 20.0s */}
      <Sequence from={s(16.0)} durationInFrames={s(4.0)}>
        <AbsoluteFill>
          <Scene8Closer />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

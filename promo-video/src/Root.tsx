import React from "react";
import { Composition } from "remotion";
import { ScrollarPromo } from "./Video";

/**
 * Register compositions.
 * Format: 1080×1920 (9:16 vertical), 60fps, 20 seconds = 1200 frames.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ScrollarPromo"
        component={ScrollarPromo}
        durationInFrames={1200}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};

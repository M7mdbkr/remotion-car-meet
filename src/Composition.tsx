import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

type ClipSpec = {
  file: string;
  frames: number;
  volume: number;
  zoomFrom: number;
  zoomTo: number;
};

const clips: ClipSpec[] = [
  { file: "hook_burnout", frames: 23, volume: 1, zoomFrom: 1.02, zoomTo: 1.08 },
  { file: "laugh_opener", frames: 27, volume: 0.2, zoomFrom: 1.01, zoomTo: 1.05 },
  { file: "roadster_smile", frames: 26, volume: 0.18, zoomFrom: 1.03, zoomTo: 1.07 },
  { file: "unique_smile", frames: 24, volume: 0.16, zoomFrom: 1.02, zoomTo: 1.06 },
  { file: "roadster_wide", frames: 33, volume: 0.12, zoomFrom: 1, zoomTo: 1.04 },
  { file: "roadster_close", frames: 27, volume: 0.16, zoomFrom: 1.02, zoomTo: 1.07 },
  { file: "laugh_car", frames: 27, volume: 0.25, zoomFrom: 1.01, zoomTo: 1.05 },
  { file: "purple_fun", frames: 27, volume: 0.18, zoomFrom: 1.02, zoomTo: 1.06 },
  { file: "unique_gesture", frames: 24, volume: 0.16, zoomFrom: 1.02, zoomTo: 1.06 },
  { file: "neon_trunk", frames: 24, volume: 0.12, zoomFrom: 1.01, zoomTo: 1.06 },
  { file: "bmw_glow", frames: 24, volume: 0.14, zoomFrom: 1.02, zoomTo: 1.07 },
  { file: "underglow_side", frames: 24, volume: 0.12, zoomFrom: 1.01, zoomTo: 1.06 },
  { file: "red_classic", frames: 24, volume: 0.12, zoomFrom: 1.01, zoomTo: 1.05 },
  { file: "flame_pop", frames: 27, volume: 0.9, zoomFrom: 1.02, zoomTo: 1.07 },
  { file: "happy_crowd", frames: 30, volume: 0.2, zoomFrom: 1, zoomTo: 1.04 },
  { file: "friends_laugh", frames: 27, volume: 0.24, zoomFrom: 1.02, zoomTo: 1.06 },
  { file: "roadster_grin", frames: 27, volume: 0.2, zoomFrom: 1.02, zoomTo: 1.06 },
  { file: "drift_smoke", frames: 30, volume: 0.75, zoomFrom: 1.01, zoomTo: 1.05 },
  { file: "final_burnout", frames: 78, volume: 1, zoomFrom: 1, zoomTo: 1.045 },
];

let nextStart = 0;
const scheduledClips = clips.map((clip) => {
  const from = nextStart;
  nextStart += clip.frames;
  return { ...clip, from };
});

const totalFrames = nextStart;
const yellow = "#FFE44D";
const purple = "#C968FF";

const Clip: React.FC<ClipSpec> = ({ file, frames, volume, zoomFrom, zoomTo }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden" }}>
      <Video
        src={staticFile(`clips/${file}.mp4`)}
        volume={volume}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: interpolate(frame, [0, Math.max(1, frames - 1)], [zoomFrom, zoomTo], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.16) 0%, transparent 22%, transparent 72%, rgba(0,0,0,0.24) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const HookText: React.FC<{
  topLine: string;
  emphasis: string;
  emphasisColor?: string;
}> = ({ topLine, emphasis, emphasisColor = yellow }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "170px 80px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          textAlign: "center",
          opacity: interpolate(frame, [0, 4, 42, 49], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 7], [0.9, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.2, 1.35, 0.32, 1),
          }),
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 58,
            fontWeight: 850,
            letterSpacing: 1.5,
            lineHeight: 1,
            textShadow: "0 5px 20px rgba(0,0,0,0.95)",
          }}
        >
          {topLine}
        </div>
        <div
          style={{
            marginTop: 12,
            color: emphasisColor,
            fontSize: 118,
            fontWeight: 950,
            letterSpacing: -4,
            lineHeight: 0.92,
            WebkitTextStroke: "3px rgba(0,0,0,0.5)",
            textShadow: "0 8px 28px rgba(0,0,0,0.95)",
          }}
        >
          {emphasis}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PopLabel: React.FC<{
  line1: string;
  line2?: string;
  color: string;
  position?: "top" | "bottom";
}> = ({ line1, line2, color, position = "bottom" }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: position === "bottom" ? "flex-end" : "flex-start",
        alignItems: "center",
        padding: position === "bottom" ? "0 80px 210px" : "180px 80px 0",
      }}
    >
      <div
        style={{
          textAlign: "center",
          opacity: interpolate(frame, [0, 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 7], [0.88, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.2, 1.35, 0.32, 1),
          }),
          rotate: interpolate(frame, [0, 7], ["-2deg", "0deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "rgba(0,0,0,0.76)",
            border: `3px solid ${color}`,
            borderRadius: 22,
            padding: "15px 28px 12px",
            color: "white",
            fontSize: 59,
            fontWeight: 900,
            letterSpacing: -1.5,
            lineHeight: 1.02,
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          {line1}
          {line2 ? (
            <>
              <br />
              <span style={{ color }}>{line2}</span>
            </>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
        opacity: interpolate(frame, [0, 2], [0.42, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

const musicVolume = (frame: number) => {
  if (frame < 23) return 0.1;
  if (frame >= 334 && frame < 361) return 0.12;
  if (frame >= 445 && frame < 475) return 0.14;
  if (frame >= 475) return 0.08;
  return 0.34;
};

const CarMeetEdit: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050505",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {scheduledClips.map((clip) => (
        <Sequence key={`${clip.file}-${clip.from}`} from={clip.from} durationInFrames={clip.frames}>
          <Clip {...clip} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/glitter-nights-beat.m4a")} loop volume={musicVolume} />
      <Audio
        src={staticFile("audio/glitter-nights-bass.m4a")}
        loop
        volume={(frame) => musicVolume(frame) * 0.22}
      />

      <Sequence from={21} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={99} durationInFrames={18}>
        <Audio src={staticFile("sfx/shutter.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={237} durationInFrames={20}>
        <Audio src={staticFile("sfx/ding.wav")} volume={0.38} />
      </Sequence>

      <Sequence durationInFrames={50}>
        <HookText topLine="WE CAME FOR THE" emphasis="CARS..." />
      </Sequence>
      <Sequence from={50} durationInFrames={50}>
        <HookText topLine="STAYED FOR THE" emphasis="CHAOS 😂" />
      </Sequence>
      <Sequence from={238} durationInFrames={72}>
        <PopLabel line1="OKAY, THE" line2="GLOW-UP ✨" color={purple} />
      </Sequence>
      <Sequence from={334} durationInFrames={27}>
        <PopLabel line1="TOTALLY" line2="NORMAL. 🔥" color={yellow} position="top" />
      </Sequence>
      <Sequence from={475} durationInFrames={78}>
        <PopLabel line1="10/10" line2="WOULD DO IT AGAIN." color={yellow} position="top" />
      </Sequence>

      {[23, 50, 100, 238, 334, 361, 445, 475].map((from) => (
        <Sequence key={from} from={from} durationInFrames={3}>
          <Flash />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="CarMeetHappyChaos"
      component={CarMeetEdit}
      durationInFrames={totalFrames}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};

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

type StoryClip = {
  file: string;
  frames: number;
  volume: number;
  zoomFrom?: number;
  zoomTo?: number;
};

const storyClips: StoryClip[] = [
  { file: "hook_smoke", frames: 41, volume: 0.95, zoomFrom: 1.01, zoomTo: 1.05 },
  { file: "hook_twenty", frames: 31, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.04 },
  { file: "hook_ten", frames: 31, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.04 },
  { file: "hook_flame", frames: 32, volume: 0.92, zoomFrom: 1.02, zoomTo: 1.06 },
  { file: "arrival_crowd", frames: 75, volume: 0.58 },
  { file: "arrival_roadster", frames: 60, volume: 0.58, zoomFrom: 1.01, zoomTo: 1.045 },
  { file: "car_red", frames: 33, volume: 0.5, zoomFrom: 1.01, zoomTo: 1.055 },
  { file: "car_bmw", frames: 33, volume: 0.5, zoomFrom: 1.01, zoomTo: 1.055 },
  { file: "car_neon", frames: 33, volume: 0.5, zoomFrom: 1.01, zoomTo: 1.055 },
  { file: "car_close", frames: 36, volume: 0.5, zoomFrom: 1.01, zoomTo: 1.055 },
  { file: "drift_smoke_long", frames: 57, volume: 0.96, zoomFrom: 1.005, zoomTo: 1.035 },
  { file: "drift_emerge", frames: 78, volume: 0.98, zoomFrom: 1.005, zoomTo: 1.04 },
  { file: "premise", frames: 120, volume: 1.02, zoomFrom: 1.005, zoomTo: 1.025 },
  { file: "p1_rating", frames: 66, volume: 1.05 },
  { file: "p1_predict", frames: 78, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.03 },
  { file: "p2_rating", frames: 69, volume: 1.05 },
  { file: "p2_predict", frames: 69, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.03 },
  { file: "p3_rating", frames: 69, volume: 1.05 },
  { file: "p3_predict", frames: 69, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.03 },
  { file: "p4_rating", frames: 48, volume: 1.05 },
  { file: "p4_predict", frames: 96, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.03 },
  { file: "p5_rating", frames: 66, volume: 1.05 },
  { file: "p5_predict", frames: 75, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.03 },
  { file: "p6_rating", frames: 66, volume: 1.05 },
  { file: "p6_predict", frames: 69, volume: 1.05, zoomFrom: 1.01, zoomTo: 1.03 },
  { file: "peak_twenty", frames: 129, volume: 1.05, zoomFrom: 1.005, zoomTo: 1.035 },
  { file: "end_burnout", frames: 96, volume: 0.98, zoomFrom: 1.005, zoomTo: 1.045 },
];

let nextStart = 0;
const scheduled = storyClips.map((clip) => {
  const from = nextStart;
  nextStart += clip.frames;
  return { ...clip, from };
});

export const longStoryFrames = nextStart;

const palette = {
  yellow: "#FFD84D",
  green: "#58F29A",
  purple: "#CF73FF",
  white: "#FFFFFF",
  ink: "#090909",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ClipLayer: React.FC<StoryClip> = ({
  file,
  frames,
  volume,
  zoomFrom = 1,
  zoomTo = 1.035,
}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, Math.max(1, frames - 1)], [zoomFrom, zoomTo], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink, overflow: "hidden" }}>
      <Video
        src={staticFile(`story-clips/${file}.mp4`)}
        objectFit="cover"
        volume={(localFrame) => {
          const fadeIn = interpolate(localFrame, [0, 2], [0.45, 1], clamp);
          const fadeOut = interpolate(localFrame, [Math.max(0, frames - 3), frames - 1], [1, 0.45], clamp);
          return volume * Math.min(fadeIn, fadeOut);
        }}
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.40) 0%, rgba(0,0,0,.02) 24%, rgba(0,0,0,.02) 66%, rgba(0,0,0,.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Enter: React.FC<React.PropsWithChildren<{ offsetY?: number; delay?: number }>> = ({
  children,
  offsetY = 24,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 7], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 1.22, 0.34, 1),
  });
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * offsetY}px) scale(${0.94 + progress * 0.06})`,
      }}
    >
      {children}
    </div>
  );
};

const MainTitle: React.FC<{
  eyebrow?: string;
  line1: string;
  line2?: string;
  accent?: string;
  align?: "top" | "middle";
}> = ({ eyebrow, line1, line2, accent = palette.yellow, align = "top" }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: align === "top" ? "flex-start" : "center",
        alignItems: "center",
        padding: align === "top" ? "175px 64px 0" : "0 64px 180px",
        textAlign: "center",
        direction: "rtl",
      }}
    >
      <Enter>
        {eyebrow ? (
          <div
            style={{
              display: "inline-block",
              padding: "8px 20px 10px",
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,.72)",
              border: "2px solid rgba(255,255,255,.32)",
              color: palette.white,
              fontSize: 34,
              fontWeight: 750,
              marginBottom: 14,
              boxShadow: "0 8px 26px rgba(0,0,0,.35)",
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            color: palette.white,
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -2,
            textShadow: "0 6px 24px rgba(0,0,0,.95), 0 2px 2px rgba(0,0,0,1)",
          }}
        >
          {line1}
          {line2 ? (
            <>
              <br />
              <span style={{ color: accent, fontSize: 82, fontWeight: 950 }}>{line2}</span>
            </>
          ) : null}
        </div>
      </Enter>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ children: React.ReactNode; accent?: string }> = ({
  children,
  accent = palette.white,
}) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 58px 300px",
        direction: "rtl",
        textAlign: "center",
      }}
    >
      <Enter offsetY={18}>
        <div
          style={{
            maxWidth: 920,
            borderRadius: 20,
            padding: "14px 25px 17px",
            color: accent,
            backgroundColor: "rgba(0,0,0,.78)",
            border: "2px solid rgba(255,255,255,.22)",
            fontSize: 48,
            fontWeight: 850,
            lineHeight: 1.16,
            boxShadow: "0 9px 28px rgba(0,0,0,.48)",
            textShadow: "0 2px 2px rgba(0,0,0,1)",
          }}
        >
          {children}
        </div>
      </Enter>
    </AbsoluteFill>
  );
};

const ScoreOverlay: React.FC<{
  person: number;
  mode: "rating" | "prediction" | "favorite";
  score: string;
  caption: string;
  note?: string;
}> = ({ person, mode, score, caption, note }) => {
  const color = mode === "rating" ? palette.yellow : mode === "prediction" ? palette.green : palette.purple;
  const label =
    mode === "rating"
      ? "تقييمه للسيارة"
      : mode === "prediction"
        ? "توقّعه لتقييم سيارته"
        : "أفضل سيارة في الإيفنت؟";

  return (
    <AbsoluteFill style={{ direction: "rtl" }}>
      <div
        style={{
          position: "absolute",
          top: 158,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <Enter>
          <div
            style={{
              minWidth: 350,
              borderRadius: 24,
              padding: "13px 24px 15px",
              backgroundColor: "rgba(7,7,7,.82)",
              border: `3px solid ${color}`,
              boxShadow: "0 8px 28px rgba(0,0,0,.45)",
            }}
          >
            <div style={{ color: palette.white, fontSize: 29, fontWeight: 800 }}>{label}</div>
            <div
              style={{
                direction: mode === "favorite" ? "rtl" : "ltr",
                color,
                fontSize: mode === "favorite" ? 54 : 72,
                fontWeight: 950,
                lineHeight: 1.05,
                letterSpacing: -3,
              }}
            >
              {score}
            </div>
          </div>
        </Enter>
        <Enter delay={2}>
          <div
            style={{
              color: palette.white,
              backgroundColor: "rgba(0,0,0,.7)",
              border: "2px solid rgba(255,255,255,.28)",
              borderRadius: 999,
              padding: "9px 17px 11px",
              fontSize: 28,
              fontWeight: 850,
            }}
          >
            {person}/6
          </div>
        </Enter>
      </div>
      <Caption accent={palette.white}>
        {caption}
        {note ? <span style={{ color, marginRight: 10 }}> {note}</span> : null}
      </Caption>
    </AbsoluteFill>
  );
};

const CutGlow: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.white,
        opacity: interpolate(frame, [0, 2], [0.17, 0], clamp),
      }}
    />
  );
};

const CarMeetingLongStory: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.ink,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Arabic', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {scheduled.map((clip) => (
        <Sequence key={clip.file} from={clip.from} durationInFrames={clip.frames} premountFor={20}>
          <ClipLayer {...clip} />
        </Sequence>
      ))}

      <Sequence durationInFrames={135}>
        <MainTitle eyebrow="أول تجمع سيارات لي" line1="والتقييمات؟" line2="ما توقعتها 😳" />
      </Sequence>
      <Sequence from={41} durationInFrames={31}>
        <Caption accent={palette.yellow}>قال: 20/10؟!</Caption>
      </Sequence>
      <Sequence from={72} durationInFrames={31}>
        <Caption accent={palette.green}>وقال: 10/10</Caption>
      </Sequence>

      <Sequence from={135} durationInFrames={135}>
        <MainTitle eyebrow="البداية" line1="أول مرة أجي" line2="الميتنق" />
      </Sequence>
      <Sequence from={270} durationInFrames={135}>
        <MainTitle eyebrow="كل زاوية" line1="سيارة تلفت" line2="النظر ✨" />
      </Sequence>
      <Sequence from={405} durationInFrames={135}>
        <MainTitle eyebrow="وبعدين..." line1="بدأ" line2="الدرفت 🔥" />
      </Sequence>
      <Sequence from={540} durationInFrames={120}>
        <MainTitle eyebrow="فكرت في فعالية 👀" line1="خلّنا نسأل" line2="المُلّاك" />
        <Caption>خلّونا نشوف كم الناس تقيّم السيارات</Caption>
      </Sequence>

      <Sequence from={660} durationInFrames={66}>
        <ScoreOverlay person={1} mode="rating" score="7/10" caption="سبعة من عشرة" />
      </Sequence>
      <Sequence from={726} durationInFrames={78}>
        <ScoreOverlay person={1} mode="prediction" score="10/10" caption="عشرة من عشرة إن شاء الله" />
      </Sequence>

      <Sequence from={804} durationInFrames={69}>
        <ScoreOverlay person={2} mode="rating" score="6.5/10" caption="ستة ونص" />
      </Sequence>
      <Sequence from={873} durationInFrames={69}>
        <ScoreOverlay person={2} mode="prediction" score="7.5–8" caption="ثمانية... سبعة ونص" />
      </Sequence>

      <Sequence from={942} durationInFrames={69}>
        <ScoreOverlay person={3} mode="favorite" score="ماكلارين" caption="الماكلارين" />
      </Sequence>
      <Sequence from={1011} durationInFrames={69}>
        <ScoreOverlay person={3} mode="favorite" score="كابرس عنابي" caption="والكابرس العنابي" note="اختيارين 👌" />
      </Sequence>

      <Sequence from={1080} durationInFrames={48}>
        <ScoreOverlay person={4} mode="rating" score="10/10" caption="عشرة من عشرة" />
      </Sequence>
      <Sequence from={1128} durationInFrames={96}>
        <ScoreOverlay person={4} mode="prediction" score="7، 9، 10" caption="الأذواق: 7، 9، 10" note="حسب المحبّين" />
      </Sequence>

      <Sequence from={1224} durationInFrames={66}>
        <ScoreOverlay person={5} mode="rating" score="8/10" caption="ثمانية من عشرة" />
      </Sequence>
      <Sequence from={1290} durationInFrames={75}>
        <ScoreOverlay person={5} mode="prediction" score="5/10" caption="نقول خمسة من عشرة" note="😅" />
      </Sequence>

      <Sequence from={1365} durationInFrames={66}>
        <ScoreOverlay person={6} mode="rating" score="8/10" caption="ثمانية من عشرة" />
      </Sequence>
      <Sequence from={1431} durationInFrames={69}>
        <ScoreOverlay person={6} mode="prediction" score="9/10" caption="سيارتي تسعة" />
      </Sequence>

      <Sequence from={1500} durationInFrames={129}>
        <MainTitle eyebrow="أقوى إجابة 😂" line1="عشرين..." line2="20/10 وفوق!" align="middle" />
        <Caption>عشرين... عشرين وفوق!</Caption>
      </Sequence>

      <Sequence from={1629} durationInFrames={60}>
        <MainTitle line1="أكيد مو" line2="آخر ميتنق." align="middle" />
      </Sequence>
      <Sequence from={1689} durationInFrames={36}>
        <MainTitle line1="وش السيارة اللي أخذت" line2="10/10 عندك؟" align="middle" />
      </Sequence>

      {[135, 270, 405, 540, 660, 804, 942, 1080, 1224, 1365, 1500, 1629].map((from) => (
        <Sequence key={`glow-${from}`} from={from} durationInFrames={3}>
          <CutGlow />
        </Sequence>
      ))}

      {[303, 336, 369].map((from) => (
        <Sequence key={`shutter-${from}`} from={from} durationInFrames={12}>
          <Audio src={staticFile("sfx/shutter.wav")} volume={0.12} />
        </Sequence>
      ))}
      <Sequence from={540} durationInFrames={18}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.13} />
      </Sequence>
      <Sequence from={1500} durationInFrames={24}>
        <Audio src={staticFile("sfx/ding.wav")} volume={0.1} />
      </Sequence>
      <Sequence from={1689} durationInFrames={18}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.11} />
      </Sequence>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "linear-gradient(90deg, #FFD84D 0%, #FF875C 50%, #58F29A 100%)",
          boxShadow: "0 2px 12px rgba(0,0,0,.45)",
        }}
      />
    </AbsoluteFill>
  );
};

export const LongStoryComposition: React.FC = () => {
  return (
    <Composition
      id="CarMeetingFirstTimeStory"
      component={CarMeetingLongStory}
      durationInFrames={longStoryFrames}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};

import "./index.css";
import { MyComposition } from "./Composition";
import { LongStoryComposition } from "./LongStory";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <LongStoryComposition />
    </>
  );
};

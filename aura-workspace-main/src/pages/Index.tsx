import { useState } from "react";
import { IntroAnimation } from "@/components/IntroAnimation";
import { Workspace } from "@/components/Workspace";

const Index = () => {
  const [showWorkspace, setShowWorkspace] = useState(false);

  return (
    <>
      {!showWorkspace && (
        <IntroAnimation onComplete={() => setShowWorkspace(true)} />
      )}
      {showWorkspace && <Workspace />}
    </>
  );
};

export default Index;

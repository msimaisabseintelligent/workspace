import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AIPromptBarProps {
  onGenerateTable: (prompt: string) => void;
}

export const AIPromptBar = ({ onGenerateTable }: AIPromptBarProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onGenerateTable(prompt);
      setPrompt("");
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <div className="bg-card/95 backdrop-blur-sm border-2 border-purple shadow-glow-purple-intense rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple/20">
            <Sparkles className="h-5 w-5 text-purple" />
          </div>
          <Input
            placeholder="Describe what you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="rounded-full h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

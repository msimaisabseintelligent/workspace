import { useState, useRef, useEffect } from "react";
import { TextBox } from "./TextBox";
import { TableBox } from "./TableBox";
import { AIPromptBar } from "./AIPromptBar";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./ui/button";
import { Maximize2 } from "lucide-react";

interface WorkspaceElement {
  id: string;
  type: "textbox" | "table";
  x: number;
  y: number;
  data?: any;
}

export const Workspace = () => {
  const [elements, setElements] = useState<WorkspaceElement[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.0005;
      setZoom((prev) => Math.min(Math.max(0.3, prev + delta), 3));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsPanning(false);
      }
    };

    const workspace = workspaceRef.current;
    if (workspace) {
      workspace.addEventListener("wheel", handleWheel, { passive: false });
      workspace.addEventListener("mousedown", handleMouseDown);
      workspace.addEventListener("mousemove", handleMouseMove);
      workspace.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (workspace) {
        workspace.removeEventListener("wheel", handleWheel);
        workspace.removeEventListener("mousedown", handleMouseDown);
        workspace.removeEventListener("mousemove", handleMouseMove);
        workspace.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [isPanning, panStart, pan]);

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        const newElement: WorkspaceElement = {
          id: `textbox-${Date.now()}`,
          type: "textbox",
          x,
          y,
        };

        setElements((prev) => [...prev, newElement]);
      }
    }
  };

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  const handleCreateLink = (text: string, url: string) => {
    console.log("Link created:", { text, url });
  };

  const parsePromptKeywords = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();
    const words = lowerPrompt.split(/\s+/);
    
    const number = parseInt(words.find((w) => !isNaN(parseInt(w))) || "5");
    
    const fitnessKeywords = ["fitness", "gym", "workout", "exercise", "health", "training"];
    const todoKeywords = ["todo", "task", "checklist", "list"];
    const studyKeywords = ["study", "studies", "learning", "education", "course"];
    const researchKeywords = ["research", "documentary", "investigation", "analysis"];

    let format: "day" | "task" | "goal" | "point" = "task";
    let title = "Tasks";
    let icon = "📋";

    if (fitnessKeywords.some((kw) => lowerPrompt.includes(kw))) {
      format = "day";
      title = "Fitness Plan";
      icon = "🏋️";
    } else if (studyKeywords.some((kw) => lowerPrompt.includes(kw))) {
      format = "goal";
      title = "Study Goals";
      icon = "📚";
    } else if (researchKeywords.some((kw) => lowerPrompt.includes(kw))) {
      format = "point";
      title = "Research Points";
      icon = "🔬";
    } else if (todoKeywords.some((kw) => lowerPrompt.includes(kw))) {
      format = "task";
      title = "To-Do List";
      icon = "✅";
    }

    return { format, title, icon, count: number };
  };

  const handleGenerateTable = (prompt: string) => {
    const { format, title, icon, count } = parsePromptKeywords(prompt);
    const rows = Array.from({ length: count }, (_, i) => `Item ${i + 1}`);

    // Calculate center based on current viewport position
    const viewportCenterX = (window.innerWidth / 2 - pan.x) / zoom;
    const viewportCenterY = (window.innerHeight / 2 - pan.y) / zoom;

    const newTable: WorkspaceElement = {
      id: `table-${Date.now()}`,
      type: "table",
      x: viewportCenterX - 250,
      y: viewportCenterY - 200,
      data: { title, icon, rows, format },
    };

    setElements((prev) => [...prev, newTable]);
  };

  const handleCenterAll = () => {
    if (elements.length === 0) return;

    // Calculate the center of the current viewport
    const viewportCenterX = (window.innerWidth / 2 - pan.x) / zoom;
    const viewportCenterY = (window.innerHeight / 2 - pan.y) / zoom;

    // Stack elements vertically around the center
    const updatedElements = elements.map((element, index) => ({
      ...element,
      x: viewportCenterX - 200,
      y: viewportCenterY - 150 + (index * 50),
    }));

    setElements(updatedElements);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeSwitcher />
        <Button
          onClick={handleCenterAll}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-lg border-2 border-purple shadow-glow-purple bg-card/95 backdrop-blur-sm"
          title="Center all elements"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div
        ref={workspaceRef}
        onClick={handleWorkspaceClick}
        className={`workspace-texture bg-[hsl(var(--workspace-bg))] ${
          isPanning ? "cursor-grabbing" : "cursor-default"
        }`}
        style={{
          width: "20000px",
          height: "20000px",
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: "0 0",
        }}
      >
        {elements.map((element) => {
          if (element.type === "textbox") {
            return (
              <TextBox
                key={element.id}
                id={element.id}
                initialX={element.x}
                initialY={element.y}
                zoom={zoom}
                onDelete={handleDeleteElement}
                onCreateLink={handleCreateLink}
              />
            );
          } else if (element.type === "table") {
            return (
              <TableBox
                key={element.id}
                id={element.id}
                initialX={element.x}
                initialY={element.y}
                zoom={zoom}
                title={element.data.title}
                icon={element.data.icon}
                rows={element.data.rows}
                format={element.data.format}
                onDelete={handleDeleteElement}
              />
            );
          }
          return null;
        })}
      </div>

      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto">
          <AIPromptBar onGenerateTable={handleGenerateTable} />
        </div>
      </div>
    </div>
  );
};

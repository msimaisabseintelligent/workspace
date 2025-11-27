import { useEffect, useState } from "react";
import { Sun, Moon, Eye } from "lucide-react";
import { Button } from "./ui/button";

type Theme = "light" | "dark" | "colorblind";

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("workspace-theme") as Theme;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    document.documentElement.classList.remove("light", "dark", "colorblind");
    document.documentElement.classList.add(newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("workspace-theme", newTheme);
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-lg border border-border shadow-lg">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="icon"
        onClick={() => handleThemeChange("light")}
        className="transition-smooth"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="icon"
        onClick={() => handleThemeChange("dark")}
        className="transition-smooth"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "colorblind" ? "default" : "ghost"}
        size="icon"
        onClick={() => handleThemeChange("colorblind")}
        className="transition-smooth"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
};

"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const current = theme === "system" ? resolvedTheme : theme;

  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant={current === "light" ? "default" : "secondary"}
        className="justify-between"
        onClick={() => setTheme("light")}
      >
        <span className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Light mode
        </span>
        {current === "light" ? "Active" : ""}
      </Button>
      <Button
        type="button"
        variant={current === "dark" ? "default" : "secondary"}
        className="justify-between"
        onClick={() => setTheme("dark")}
      >
        <span className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Dark mode
        </span>
        {current === "dark" ? "Active" : ""}
      </Button>
    </div>
  );
}

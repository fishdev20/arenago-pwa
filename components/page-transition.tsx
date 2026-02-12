"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(false);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      className={cn(
        "transition-opacity duration-300 ease-out",
        mounted ? "opacity-100" : "opacity-0"
      )}
    >
      {children}
    </div>
  );
}

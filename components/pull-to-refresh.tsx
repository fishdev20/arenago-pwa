"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type PullToRefreshProps = {
  children: React.ReactNode;
  className?: string;
};

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children, className }: PullToRefreshProps) {
  const router = useRouter();
  const [pull, setPull] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const startYRef = React.useRef<number | null>(null);
  const draggingRef = React.useRef(false);

  const onTouchStart = (event: React.TouchEvent) => {
    if (refreshing) return;
    if (window.scrollY > 0) return;
    startYRef.current = event.touches[0]?.clientY ?? null;
    draggingRef.current = true;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!draggingRef.current || refreshing) return;
    const startY = startYRef.current;
    if (startY === null) return;
    const currentY = event.touches[0]?.clientY ?? startY;
    const delta = Math.max(0, currentY - startY);
    if (delta === 0) return;

    const nextPull = Math.min(delta, MAX_PULL);
    setPull(nextPull);
    if (nextPull > 0) {
      event.preventDefault();
    }
  };

  const endPull = () => {
    draggingRef.current = false;
    startYRef.current = null;
  };

  const onTouchEnd = () => {
    if (refreshing) return;
    if (pull >= PULL_THRESHOLD) {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPull(0);
      }, 800);
      return;
    }
    setPull(0);
    endPull();
  };

  React.useEffect(() => {
    if (!refreshing) return;
    return () => setRefreshing(false);
  }, [refreshing]);

  return (
    <div
      className={cn("relative", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2"
        style={{ transform: `translate(-50%, ${pull / 2}px)` }}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full border border-border bg-background/90 px-3 py-1 shadow",
            refreshing ? "opacity-100" : pull > 0 ? "opacity-100" : "opacity-0"
          )}
        >
          <span
            className={cn(
              "h-4 w-4 rounded-full border-2 border-muted-foreground/40 border-t-primary",
              refreshing ? "animate-spin" : ""
            )}
          />
        </div>
      </div>
      <div style={{ transform: `translateY(${pull / 3}px)` }}>
        {children}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import * as React from "react";

const STORAGE_KEY = "arenago.onboarding_seen";

const slides = [
  {
    title: "Discover courts fast",
    description:
      "Find nearby venues, view availability, and filter by sport or time.",
  },
  {
    title: "Book & play together",
    description:
      "Reserve courts, join groups, and sync events in one place.",
  },
  {
    title: "Explore the map",
    description:
      "See courts live, get directions, and jump into open slots.",
  },
];

const SWIPE_THRESHOLD = 50;

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  const startX = React.useRef(0);
  const lastX = React.useRef(0);

  React.useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY) === "1";
    if (seen) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  React.useEffect(() => {
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    };
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    router.push("/login");
  };

  const next = () => {
    if (index >= slides.length - 1) {
      finish();
      return;
    }
    setAnimating(true);
    setIndex((prev) => prev + 1);
    setTimeout(() => setAnimating(false), 280);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    startX.current = event.touches[0]?.clientX ?? 0;
    lastX.current = startX.current;
    setDragging(true);
  };

  const onTouchEnd = () => {
    setDragging(false);
    const delta = (lastX.current ?? startX.current) - startX.current;
    if (delta < -SWIPE_THRESHOLD && index < slides.length - 1) {
      setAnimating(true);
      setIndex((prev) => prev + 1);
      setTimeout(() => setAnimating(false), 280);
    } else if (delta > SWIPE_THRESHOLD && index > 0) {
      setAnimating(true);
      setIndex((prev) => prev - 1);
      setTimeout(() => setAnimating(false), 280);
    }
  };

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
          Initializing ArenaGo…
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-background max-w-3xl mx-auto">
      <div className="flex flex-1 flex-col justify-between px-6 py-10 ">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            ArenaGo
          </span>
          <button
            type="button"
            className="text-sm font-semibold text-muted-foreground"
            onClick={finish}
          >
            Skip
          </button>
        </div>

        <div
          className="mt-10"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onTouchMove={(event) => {
            if (!dragging) return;
            lastX.current = event.touches[0]?.clientX ?? startX.current;
          }}
        >
          <div
            className={cn(
              "transition-opacity duration-300 ease-out",
              animating ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="h-52 w-full rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
            <h2 className="mt-8 text-2xl font-semibold">
              {slides[index].title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {slides[index].description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === index ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          <Button onClick={next}>
            {index === slides.length - 1 ? "Get started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

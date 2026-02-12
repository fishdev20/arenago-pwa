"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Heart,
  MapPinned,
  Search,
  Sparkles
} from "lucide-react";
import * as React from "react";

const sportPills = [
  "Padel",
  "Pickleball",
  "Badminton",
  "Tennis",
  "Futsal",
  "Basketball",
];

const featuredCenters = [
  {
    name: "ArenaGo Downtown",
    distance: "1.2 km",
    courts: "Padel · 6 courts",
    nextSlot: "4:30 PM",
  },
  {
    name: "Solaris Sport Club",
    distance: "2.6 km",
    courts: "Pickleball · 10 courts",
    nextSlot: "5:10 PM",
  },
];

const quickEvents = [
  { title: "Sunset Ladder", time: "Today · 6:00 PM", seats: "6 open" },
  { title: "Doubles Rush", time: "Tomorrow · 7:15 PM", seats: "2 open" },
];

export default function ExplorePage() {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const fade = Math.min(scrollY / 200, 1);

  return (
      <div className="flex flex-col">
        <header className="relative bg-primary px-6 pt-6 pb-1 text-primary-foreground">
          <div
            className="transition-all duration-300 will-change-transform"
            style={{
              opacity: 1 - fade,
              transform: `translateY(${-48 * fade}px)`,
              filter: `blur(${2 * fade}px)`,
              pointerEvents: fade >= 0.98 ? "none" : "auto",
              visibility: fade >= 0.98 ? "hidden" : "visible",
            }}
          >
              <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                ArenaGo
              </p>
              <h1 className="text-2xl font-semibold">Find your next court</h1>
            </div>
            <Button variant="secondary" size="sm" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Tonight
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button variant="secondary" size="sm">
              Login
            </Button>
            <Button variant="default" size="sm">
              Register
            </Button>
          </div>
          </div>
        </header>

        <div className="sticky top-0 z-30 flex justify-center bg-primary h-12 rounded-b-xl drop-shadow-md">
          <button
            type="button"
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute inset-0 z-10 pointer-events-auto"
          />
          <div className="absolute bottom-0 z-20 translate-y-1/2 w-full p-4 flex gap-2 drop-shadow-md">
            <div className="relative bg-background rounded-3xl w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by sport, venue, or area"
                className="pl-10"
              />
            </div>
            <Button variant={"secondary"} className="h-11 w-11 p-3 rounded-full bg-card">
              <Heart />
            </Button>
          </div>
        </div>


        <div className="flex flex-col gap-6 p-4 mt-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sportPills.map((sport) => (
                <Badge key={sport} variant="outline" className="shadow-xs">
                  {sport}
                </Badge>
              ))}
            </div>
          </div>
        <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Popular now</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>


        <div className="grid gap-4">
          {featuredCenters.map((center) => (
            <Card key={center.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{center.name}</CardTitle>
                  <Badge className="gap-1" variant="outline">
                    <MapPinned className="h-3.5 w-3.5" />
                    {center.distance}
                  </Badge>
                </div>
                <CardDescription>{center.courts}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm font-semibold">
                  <span>Next slot</span>
                  <span className="text-primary">{center.nextSlot}</span>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Instant match
                </Button>
                <Button size="sm" className="gap-2">
                  Book now
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick events</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            All events
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardContent className="space-y-4">
            {quickEvents.map((event, index) => (
              <div key={event.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                  <Badge variant="outline">{event.seats}</Badge>
                </div>
                {index === 0 ? null : <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
        </div>



      </div>
  );
}

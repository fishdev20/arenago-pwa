"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, List, MapPinned } from "lucide-react";
import Link from "next/link";
import * as React from "react";

const upcoming = [
  {
    id: "b1",
    title: "Padel · ArenaGo Downtown",
    time: "Wed · 7:00 PM",
    court: "Court 2",
    date: "2026-02-12",
  },
  {
    id: "b2",
    title: "Pickleball · Solaris Club",
    time: "Fri · 6:30 PM",
    court: "Court 5",
    date: "2026-02-14",
  },
];

const previous = [
  {
    id: "b3",
    title: "Tennis · Riverside Courts",
    time: "Mon · 8:00 PM",
    court: "Court 1",
    date: "2026-02-08",
  },
  {
    id: "b4",
    title: "Badminton · City Sports",
    time: "Sun · 3:00 PM",
    court: "Hall B",
    date: "2026-02-02",
  },
];

export default function BookingPage() {
  const [view, setView] = React.useState<"list" | "calendar">("list");

  const today = React.useMemo(() => new Date(), []);
  const monthStart = React.useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );
  const monthEnd = React.useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + 1, 0),
    [today]
  );
  const daysInMonth = monthEnd.getDate();
  const startOffset = (monthStart.getDay() + 6) % 7; // Monday start

  const bookingDates = React.useMemo(() => {
    const all = [...upcoming, ...previous];
    return new Set(all.map((b) => b.date));
  }, []);

  const calendarCells = React.useMemo(() => {
    const cells: Array<{ day: number; inMonth: boolean }> = [];
    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ day: 0, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, inMonth: true });
    }
    const totalCells = Math.ceil(cells.length / 7) * 7;
    while (cells.length < totalCells) {
      cells.push({ day: 0, inMonth: false });
    }
    return cells;
  }, [daysInMonth, startOffset]);

  const monthLabel = monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const toISODate = (day: number) =>
    new Date(today.getFullYear(), today.getMonth(), day)
      .toISOString()
      .slice(0, 10);

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/account" aria-label="Back to account">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Bookings
            </p>
            <h1 className="text-2xl font-semibold">Your schedule</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "default" : "secondary"}
            size="icon"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "calendar" ? "default" : "secondary"}
            size="icon"
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {view === "calendar" ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{monthLabel}</CardTitle>
            <CardDescription>Tap a date to view your bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day} className="text-center font-semibold">
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                const dateIso = cell.inMonth ? toISODate(cell.day) : "";
                const isBooked = cell.inMonth && bookingDates.has(dateIso);
                return (
                  <div
                    key={`${cell.day}-${idx}`}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-xl text-sm",
                      cell.inMonth
                        ? "bg-muted/40 text-foreground"
                        : "text-muted-foreground/40"
                    )}
                  >
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      <span>{cell.inMonth ? cell.day : ""}</span>
                      {isBooked ? (
                        <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-primary" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upcoming</CardTitle>
          <CardDescription>Next sessions and reservations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcoming.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3"
            >
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <MapPinned className="h-3.5 w-3.5" />
                {item.court}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Previous</CardTitle>
          <CardDescription>Past sessions and courts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {previous.map((item, index) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Badge variant="secondary">{item.court}</Badge>
              </div>
              {index === previous.length - 1 ? null : <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

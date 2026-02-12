import PageWrapper from "@/components/page-wrapper";
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
import { CalendarDays, Flame, Plus, Trophy } from "lucide-react";

const eventCards = [
  {
    title: "ArenaGo Padel Ladder",
    date: "Feb 14 · 6:00 PM",
    meta: "Ranked · 12 players",
  },
  {
    title: "Weekend Pickleball Sprint",
    date: "Feb 16 · 10:00 AM",
    meta: "Beginner+ · 16 players",
  },
];

const highlights = [
  {
    label: "Season ladder",
    value: "2 matches left",
    icon: Trophy,
  },
  {
    label: "Hot streak",
    value: "4 wins",
    icon: Flame,
  },
];

export default function EventPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Events
            </p>
          <h1 className="text-2xl font-semibold">Play more, together</h1>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New event
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your calendar</CardTitle>
          <CardDescription>Upcoming events and competitions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3"
              >
                <div className="rounded-full bg-background/80 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming events</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            View full calendar
          </Button>
        </div>
        <div className="grid gap-4">
          {eventCards.map((event) => (
            <Card key={event.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{event.title}</CardTitle>
                  <Badge variant="outline" className="gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {event.date}
                  </Badge>
                </div>
                <CardDescription>{event.meta}</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between">
                <Badge>Open spots</Badge>
                <Button size="sm">Reserve</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
      </div>
    </PageWrapper>
  );
}

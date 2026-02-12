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
import { Input } from "@/components/ui/input";
import { MessageSquareText, Search, Users, Zap } from "lucide-react";

const squads = [
  {
    name: "Padel Night Owls",
    members: "24 players",
    cadence: "Wed · 8:00 PM",
  },
  {
    name: "Pickleball Rise",
    members: "18 players",
    cadence: "Sat · 9:30 AM",
  },
];

const chats = [
  {
    name: "Downtown Courts",
    message: "Court 4 just opened for 6:30 PM",
    time: "5m",
  },
  {
    name: "ArenaGo Coaches",
    message: "Warm-up drills are live in the hub",
    time: "20m",
  },
];

export default function GroupPage() {
  return (

      <PageWrapper>
        <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Groups
            </p>
          <h1 className="text-2xl font-semibold">Your squads</h1>
        </div>
        <Button size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          New squad
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Find a group fast</CardTitle>
          <CardDescription>
            Search by sport, city, or level to match new teammates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search groups" className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Active squads</h2>
        <div className="grid gap-4">
          {squads.map((squad) => (
            <Card key={squad.name}>
              <CardHeader className="pb-3">
                <CardTitle>{squad.name}</CardTitle>
                <CardDescription>{squad.members}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm font-semibold">
                <span>Next session</span>
                <span className="text-primary">{squad.cadence}</span>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="outline">Intermediate+</Badge>
                <Button variant="secondary" size="sm" className="gap-2">
                  <MessageSquareText className="h-4 w-4" />
                  Open chat
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">New invites</h2>
        <Card>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Riverside Rally Crew</p>
              <p className="text-sm text-muted-foreground">2 open slots · Friday</p>
            </div>
            <Button size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              Join
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.name}
                className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{chat.name}</p>
                  <p className="text-xs text-muted-foreground">{chat.message}</p>
                </div>
                <Badge variant="secondary">{chat.time}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      </div>
      </PageWrapper>

  );
}

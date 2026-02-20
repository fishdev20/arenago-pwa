"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Bell, ChevronRight, Settings, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useAuthUser } from "@/lib/query/use-auth-user";
import { signOut } from "@/lib/api/auth";

const settingsRows = [
  { label: "Notifications", icon: Bell },
  { label: "Membership", icon: Star },
  { label: "Security", icon: ShieldCheck },
  { label: "Preferences", icon: Settings, href: "/preferences" },
];

export default function AccountPage() {
  const { data: user, isLoading } = useAuthUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Guest";

  const initials = React.useMemo(() => {
    if (!displayName) return "AG";
    return String(displayName)
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [displayName]);

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <Card className="overflow-hidden">
        <CardContent className="flex items-start gap-4 pt-6">
          <Link href="/profile" aria-label="Edit profile">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={user?.user_metadata?.avatar_url ?? "/avatar.png"}
                alt={displayName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Account
            </p>
            <h1 className="text-2xl font-semibold">
              {isLoading ? "Loading..." : displayName}
            </h1>
            <div className="flex items-center gap-2">
              <Badge>{user ? "Member" : "Guest"}</Badge>
              <span className="text-xs text-muted-foreground">
                {user?.created_at
                  ? `Since ${new Date(user.created_at).getFullYear()}`
                  : "Sign in to sync"}
              </span>
            </div>
            {!user ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" variant="secondary" className="rounded-full">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            ) : null}
          </div>
          {user ? (
            <Button asChild variant="secondary" size="sm">
              <Link href="/profile">Edit</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Booking summary</CardTitle>
          <CardDescription>Keep your weekly routine on track.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Link
            href="/booking"
            className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 transition hover:bg-muted/80"
          >
            <div>
              <p className="text-xs text-muted-foreground">Next booking</p>
              <p className="font-semibold">Padel · Wed 7:00 PM</p>
            </div>
            <Button size="sm">View</Button>
          </Link>
          <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Active passes</p>
              <p className="font-semibold">Monthly Unlimited</p>
            </div>
            <Badge variant="outline">Renews 3/1</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick settings</CardTitle>
          <CardDescription>Manage your ArenaGo experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsRows.map((row, index) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="space-y-3">
                {row.href ? (
                  <Link
                    href={row.href}
                    className="flex w-full items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-left transition hover:bg-muted/70"
                  >
                    <span className="flex items-center gap-3 font-semibold">
                      <span className="rounded-full bg-background/80 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      {row.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-left transition hover:bg-muted/70"
                  >
                    <span className="flex items-center gap-3 font-semibold">
                      <span className="rounded-full bg-background/80 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      {row.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                {index === settingsRows.length - 1 ? null : <Separator />}
              </div>
            );
          })}
        </CardContent>
        <CardFooter>
          {user ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                await signOut();
                window.location.href = "/login";
              }}
            >
              Sign out
            </Button>
          ) : (
            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

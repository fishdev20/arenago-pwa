"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Ari Lee",
    email: "ari@arenago.com",
    phone: "+1 415 555 0198",
  });

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/account" aria-label="Back to account">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Profile
          </p>
          <h1 className="text-2xl font-semibold">Edit profile</h1>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/avatar.png" alt={profile.name} />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Button variant="secondary">Change photo</Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Full name</label>
            <Input
              value={profile.name}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <Input
              type="email"
              value={profile.email}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Phone</label>
            <Input
              value={profile.phone}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

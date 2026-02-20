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
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/lib/query/use-auth-user";
import { useProfile } from "@/lib/query/use-profile";
import { queryKeys } from "@/lib/query/query-keys";
import { upsertProfile } from "@/lib/api/profile";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProfileForm = {
  display_name: string;
  photo_url: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
};

const emptyProfile: ProfileForm = {
  display_name: "",
  photo_url: "",
  bio: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  phone: "",
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [message, setMessage] = useState<string | null>(null);

  const { data: user } = useAuthUser();
  const { data: profile, isLoading } = useProfile(user?.id);
  console.log(profile)

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      photo_url: profile.photo_url ?? "",
      bio: profile.bio ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      country: profile.country ?? "",
      postal_code: profile.postal_code ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile]);

  const initials = useMemo(() => {
    const name =
      form.display_name || user?.user_metadata?.full_name || user?.email || "";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [form.display_name, user?.user_metadata, user?.email]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Missing user");
      await upsertProfile(user.id, {
        display_name: form.display_name,
        photo_url: form.photo_url,
        bio: form.bio,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postal_code: form.postal_code,
        phone: form.phone,
        email: user.email,
      });
    },
    onSuccess: () => {
      setMessage("Profile saved.");
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(user?.id) });
    },
    onError: (err: Error) => {
      setMessage(err.message);
    },
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
              <AvatarImage src={form.photo_url || "/avatar.png"} alt="Profile" />
              <AvatarFallback>{initials || "AG"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-semibold">Photo URL</label>
              <Input
                value={form.photo_url}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, photo_url: event.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Display name</label>
              <Input
                value={form.display_name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    display_name: event.target.value,
                  }))
                }
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Email</label>
              <Input value={user?.email ?? ""} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Bio</label>
            <textarea
              value={form.bio}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, bio: event.target.value }))
              }
              placeholder="Tell players a bit about you."
              className="min-h-[96px] w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Phone</label>
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Country</label>
              <Input
                value={form.country}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, country: event.target.value }))
                }
                placeholder="Country"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">City</label>
              <Input
                value={form.city}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">State</label>
              <Input
                value={form.state}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, state: event.target.value }))
                }
                placeholder="State"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Address</label>
              <Input
                value={form.address}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, address: event.target.value }))
                }
                placeholder="Street address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Postal code</label>
              <Input
                value={form.postal_code}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    postal_code: event.target.value,
                  }))
                }
                placeholder="ZIP / postal code"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Role: {profile?.role ?? "unknown"}</Badge>
            <Badge variant="outline">
              Active: {profile?.is_active ? "Yes" : "No"}
            </Badge>
            {profile?.created_at ? (
              <Badge variant="outline">
                Joined: {new Date(profile.created_at).getFullYear()}
              </Badge>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {message ? (
            <p className="text-xs font-semibold text-muted-foreground">
              {message}
            </p>
          ) : null}
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || isLoading || !user?.id}
          >
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

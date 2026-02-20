"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/lib/api/auth";

export default function RoleRedirectPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wrong app</CardTitle>
          <CardDescription>
            This ArenaGo app is for end users only. Your account role isn’t
            supported here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={async () => {
              await signOut();
              window.location.href = "/login";
            }}
          >
            Sign out
          </Button>
          <Button asChild variant="secondary">
            <Link href="/login">Switch account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

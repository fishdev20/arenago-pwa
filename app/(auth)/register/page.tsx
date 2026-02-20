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
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { signInWithGoogle, signUpWithPassword } from "@/lib/api/auth";

export default function RegisterPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const origin = window.location.origin;
    try {
      await signUpWithPassword(email, password, name, `${origin}/auth/callback`);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed.";
      setLoading(false);
      setError(message);
      return;
    }
    try {
      sessionStorage.setItem(
        "arenago.just_registered",
        JSON.stringify({ name })
      );
    } catch {
      // ignore
    }
    setSuccess("Check your email to confirm your account.");
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const origin = window.location.origin;
    try {
      await signInWithGoogle(`${origin}/auth/callback`);
      try {
        sessionStorage.setItem("arenago.just_registered", JSON.stringify({}));
      } catch {
        // ignore
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign up failed.";
      setLoading(false);
      setError(message);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center gap-6 px-4 py-6">
      <div className="text-center">
        <Badge className="mb-3">ArenaGo</Badge>
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Join ArenaGo to book courts and meet new players.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create your ArenaGo account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Full name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Ari Lee"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="you@arenago.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                className="pl-10"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
          {error ? (
            <p className="text-xs font-semibold text-destructive">{error}</p>
          ) : null}
          {success ? (
            <p className="text-xs font-semibold text-emerald-600">{success}</p>
          ) : null}
          <Button
            className="w-full gap-2"
            onClick={handleRegister}
            disabled={loading}
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to ArenaGo terms and privacy.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Sign up with Google
          </Button>
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-semibold text-primary" href="/login">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

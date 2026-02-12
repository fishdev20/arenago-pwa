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
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] flex-col justify-center gap-6 px-4 py-6">
      <div className="text-center">
        <Badge className="mb-3">ArenaGo</Badge>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage courts, events, and bookings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use any details for now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="you@arenago.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" className="pl-10" placeholder="••••••••" />
            </div>
          </div>
          <Button className="w-full gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Forgot password?</span>
            <span>Need help</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button variant="secondary" className="w-full">
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground">
            New to ArenaGo?{" "}
            <Link className="font-semibold text-primary" href="/register">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

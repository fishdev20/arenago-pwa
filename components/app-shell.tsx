"use client";

import {
  CalendarDays,
  CalendarCheck,
  Compass,
  MapPinned,
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/lib/query/use-auth-user";
import { useProfileRole } from "@/lib/query/use-profile";

const navItems = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/group", label: "Group", icon: Users },
  { href: "/map", label: "Map", icon: MapPinned },
  { href: "/booking", label: "Booking", icon: CalendarCheck },
  { href: "/event", label: "Event", icon: CalendarDays },
  { href: "/account", label: "Account", icon: UserCircle2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMapPage = pathname === "/map";
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth");
  const isRolePage = pathname.startsWith("/role-redirect");
  const lastPathRef = React.useRef<string | null>(null);

  const { data: user } = useAuthUser();
  const { data: profile } = useProfileRole(user?.id);

  React.useEffect(() => {
    if (!user?.id) return;
    if (isAuthPage || isRolePage) return;
    if (!profile?.role) return;
    if (profile.role !== "user") {
      router.replace("/role-redirect");
    }
  }, [user?.id, profile?.role, isAuthPage, isRolePage, router]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  React.useEffect(() => {
    const previousPath = lastPathRef.current;
    if (previousPath && previousPath !== pathname) {
      cacheScrollPosition(previousPath);
    }
    restoreScrollPosition(pathname);
    lastPathRef.current = pathname;
  }, [pathname]);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className={cn("min-h-screen", isAuthPage ? "pb-0" : "")}>
      <main
        className={cn(
          "relative mx-auto flex w-full flex-col gap-6",
          isMapPage ? "max-w-none px-0 pt-0 pb-0" : "max-w-3xl pb-24",
          isAuthPage ? "px-4 py-10" : ""
        )}
      >
        {children}
      </main>

      {isAuthPage ? null : (
        <nav className="fixed bottom-0 left-0 right-0 z-[999]">
          <div className="flex w-full mx-auto max-w-xl items-center justify-between gap-2 border border-border/60 bg-background/80 px-4 py-3 shadow-lg backdrop-blur">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={false}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold transition",
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

// Scroll position cache per route
const SCROLL_KEY_PREFIX = "arenago.scroll.";

function cacheScrollPosition(path: string) {
  try {
    sessionStorage.setItem(
      `${SCROLL_KEY_PREFIX}${path}`,
      String(window.scrollY)
    );
  } catch {
    // ignore
  }
}

function restoreScrollPosition(path: string) {
  try {
    const saved = sessionStorage.getItem(`${SCROLL_KEY_PREFIX}${path}`);
    if (!saved) return;
    const y = Number(saved);
    if (Number.isFinite(y)) {
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    }
  } catch {
    // ignore
  }
}

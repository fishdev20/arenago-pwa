"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      router.replace("/explore");
    };
    run();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-sm text-muted-foreground">Signing you in...</div>
    </div>
  );
}

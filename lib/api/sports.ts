import { supabase } from "@/lib/supabase/client";

export type Sport = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

export async function getActiveSports() {
  const { data, error } = await supabase
    .from("sports")
    .select("id, name, slug, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Sport[];
}

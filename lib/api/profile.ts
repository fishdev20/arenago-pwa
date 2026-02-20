import { supabase } from "@/lib/supabase/client";

export type ProfileRecord = {
  display_name: string | null;
  photo_url: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "display_name, photo_url, bio, address, city, state, country, postal_code, phone, role, is_active, created_at"
    )
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as ProfileRecord;
}

export async function getProfileRole(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as { role: string | null };
}

export type ProfileUpdate = {
  display_name: string;
  photo_url: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email?: string | null;
};

export async function upsertProfile(userId: string, payload: ProfileUpdate) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    ...payload,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

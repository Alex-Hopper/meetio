"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createGroup(name: string, dates: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name, created_by: user.id })
    .select("id")
    .single();

  if (groupError || !group) {
    return { error: groupError?.message ?? "Failed to create group" };
  }

  // Add creator as owner
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: user.id, role: "owner" });

  if (memberError) {
    return { error: memberError.message };
  }

  // Insert selected dates
  if (dates.length > 0) {
    const { error: datesError } = await supabase
      .from("group_dates")
      .insert(dates.map((date) => ({ group_id: group.id, date })));

    if (datesError) {
      return { error: datesError.message };
    }
  }

  redirect(`/groups/${group.id}`);
}

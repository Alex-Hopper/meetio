"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export async function inviteMember(groupId: string, email: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check caller is a member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "You are not a member of this group" };
  }

  // Look up profile by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!profile) {
    return { error: "No user found with that email address" };
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", profile.id)
    .single();

  if (existing) {
    return { error: "This user is already a member of the group" };
  }

  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: profile.id, role: "member" as const });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function saveAvailability(
  groupId: string,
  slots: { groupDateId: string; startTime: string; endTime: string }[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Delete existing availability for this user in this group
  await supabase
    .from("availability_slots")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  // Insert new slots
  if (slots.length > 0) {
    const { error } = await supabase.from("availability_slots").insert(
      slots.map((s) => ({
        group_id: groupId,
        group_date_id: s.groupDateId,
        user_id: user.id,
        start_time: s.startTime,
        end_time: s.endTime,
      }))
    );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function createMeeting(
  groupId: string,
  title: string,
  scheduledStart: string,
  scheduledEnd: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify membership
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "You are not a member of this group" };
  }

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      group_id: groupId,
      title,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !meeting) {
    return { error: error?.message ?? "Failed to create meeting" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true, meetingId: meeting.id };
}

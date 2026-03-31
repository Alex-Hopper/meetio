import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { GroupDetail } from "./group-detail";

type MemberWithProfile = {
  user_id: string;
  role: "owner" | "member";
  profiles: { display_name: string | null; email: string };
};

type SlotRow = {
  user_id: string;
  group_date_id: string;
  start_time: string;
  end_time: string;
};

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch group
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, description, created_by")
    .eq("id", groupId)
    .single();

  if (!group) notFound();

  // Fetch members with profile info
  const { data: membersData } = await supabase
    .from("group_members")
    .select("user_id, role, profiles(display_name, email)")
    .eq("group_id", groupId);

  const members = (membersData ?? []) as unknown as MemberWithProfile[];

  // Verify current user is a member
  if (!members.some((m) => m.user_id === user.id)) notFound();

  // Fetch dates and availability in parallel
  const [{ data: datesData }, { data: slotsData }] = await Promise.all([
    supabase
      .from("group_dates")
      .select("id, date")
      .eq("group_id", groupId)
      .order("date"),
    supabase
      .from("availability_slots")
      .select("user_id, group_date_id, start_time, end_time")
      .eq("group_id", groupId),
  ]);

  const dates = (datesData ?? []) as { id: string; date: string }[];
  const slots = (slotsData ?? []) as SlotRow[];

  return (
    <GroupDetail
      group={group as { id: string; name: string; description: string | null; created_by: string }}
      members={members}
      dates={dates}
      slots={slots}
      currentUserId={user.id}
    />
  );
}

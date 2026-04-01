import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { MeetingRoom } from "./meeting-room";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ groupId: string; meetingId: string }>;
}) {
  const { groupId, meetingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch meeting
  const { data: meeting } = await supabase
    .from("meetings")
    .select("id, group_id, title, scheduled_start, scheduled_end, daily_room_url, daily_room_name, status")
    .eq("id", meetingId)
    .eq("group_id", groupId)
    .single();

  if (!meeting) notFound();

  // Verify membership
  const { data: membership } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) notFound();

  // Get user's display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .single();

  const userName = profile?.display_name || profile?.email || "User";

  // Fetch group name for breadcrumb
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .single();

  return (
    <MeetingRoom
      meeting={meeting as {
        id: string;
        group_id: string;
        title: string | null;
        scheduled_start: string;
        scheduled_end: string;
        daily_room_url: string | null;
        daily_room_name: string | null;
        status: "scheduled" | "active" | "ended";
      }}
      groupId={groupId}
      groupName={group?.name ?? "Group"}
      userName={userName}
    />
  );
}

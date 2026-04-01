import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createDailyRoom,
  getDailyUsageMinutes,
  DAILY_PARTICIPANT_MINUTES_LIMIT,
} from "@/lib/daily";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { meetingId } = await req.json();
  if (!meetingId) {
    return NextResponse.json(
      { error: "meetingId is required" },
      { status: 400 }
    );
  }

  // Fetch meeting and verify the user is a member of the group
  const { data: meeting } = await supabase
    .from("meetings")
    .select("id, group_id, daily_room_url, daily_room_name")
    .eq("id", meetingId)
    .single();

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  // If room already exists, return it
  if (meeting.daily_room_url) {
    return NextResponse.json({
      url: meeting.daily_room_url,
      name: meeting.daily_room_name,
    });
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", meeting.group_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a group member" }, { status: 403 });
  }

  // Check participant-minutes usage before creating a new room
  const usageMinutes = await getDailyUsageMinutes();
  if (usageMinutes >= DAILY_PARTICIPANT_MINUTES_LIMIT) {
    return NextResponse.json(
      {
        error: `Monthly participant-minutes limit reached (${usageMinutes}/${DAILY_PARTICIPANT_MINUTES_LIMIT}). New meetings are disabled to stay within the free tier.`,
      },
      { status: 403 }
    );
  }

  // Create room with Daily.co
  const roomName = `meetbest-${meetingId.slice(0, 8)}-${Date.now()}`;
  const room = await createDailyRoom(roomName);

  // Race-condition-safe update: only set if still null
  const { data: updated } = await supabase
    .from("meetings")
    .update({
      daily_room_url: room.url,
      daily_room_name: room.name,
      status: "active" as const,
    })
    .eq("id", meetingId)
    .is("daily_room_url", null)
    .select("daily_room_url, daily_room_name")
    .single();

  // If another request already set the room, return that instead
  if (!updated) {
    const { data: existing } = await supabase
      .from("meetings")
      .select("daily_room_url, daily_room_name")
      .eq("id", meetingId)
      .single();

    return NextResponse.json({
      url: existing?.daily_room_url,
      name: existing?.daily_room_name,
    });
  }

  return NextResponse.json({
    url: updated.daily_room_url,
    name: updated.daily_room_name,
  });
}

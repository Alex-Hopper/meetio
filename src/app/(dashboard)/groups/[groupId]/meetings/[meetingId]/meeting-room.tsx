"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCall } from "@/components/video-call";
import { ChatPanel } from "@/components/chat-panel";

interface Meeting {
  id: string;
  group_id: string;
  title: string | null;
  scheduled_start: string;
  scheduled_end: string;
  daily_room_url: string | null;
  daily_room_name: string | null;
  status: "scheduled" | "active" | "ended";
}

interface MeetingRoomProps {
  meeting: Meeting;
  groupId: string;
  groupName: string;
  userName: string;
  currentUserId: string;
}

export function MeetingRoom({
  meeting,
  groupId,
  groupName,
  userName,
  currentUserId,
}: MeetingRoomProps) {
  const [roomUrl, setRoomUrl] = useState<string | null>(
    meeting.daily_room_url
  );
  const [isJoining, setIsJoining] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    // If room already exists, just join it
    if (roomUrl) {
      setInCall(true);
      return;
    }

    // Create the room via the API
    setIsJoining(true);
    setError(null);

    try {
      const res = await fetch("/api/daily-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: meeting.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create room");
        return;
      }

      setRoomUrl(data.url);
      setInCall(true);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }

  const start = new Date(meeting.scheduled_start);
  const end = new Date(meeting.scheduled_end);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href={`/groups/${groupId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" />
            {groupName}
          </Link>
          <h1 className="text-xl font-bold tracking-tight">
            {meeting.title || "Untitled meeting"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(start, "EEEE, MMM d")} &middot;{" "}
            {format(start, "h:mm a")} &ndash; {format(end, "h:mm a")}
          </p>
        </div>
      </div>

      {/* Video + Chat */}
      <div className="flex gap-4" style={{ height: "calc(100vh - 200px)" }}>
        <div className="flex-1 min-w-0">
          {inCall && roomUrl ? (
            <VideoCall
              roomUrl={roomUrl}
              userName={userName}
              onLeave={() => setInCall(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 space-y-4">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <Video className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Ready to join?</p>
                <p className="text-xs text-muted-foreground">
                  {roomUrl
                    ? "A room is active. Click to join the call."
                    : "You'll be the first to join. A room will be created for you."}
                </p>
              </div>
              <Button onClick={handleJoin} disabled={isJoining}>
                <Video className="size-3.5" />
                {isJoining ? "Setting up…" : "Join now"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </div>

        <div className="w-80 shrink-0">
          <ChatPanel
            meetingId={meeting.id}
            currentUserId={currentUserId}
            userName={userName}
          />
        </div>
      </div>
    </div>
  );
}

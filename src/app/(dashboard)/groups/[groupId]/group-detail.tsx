"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { UserPlus, Crown, CalendarPlus, Video, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AvailabilityGrid } from "@/components/availability-grid";
import { inviteMember, createMeeting } from "../actions";

type MemberWithProfile = {
  user_id: string;
  role: "owner" | "member";
  profiles: { display_name: string | null; email: string };
};

type DateEntry = { id: string; date: string };

type SlotEntry = {
  user_id: string;
  group_date_id: string;
  start_time: string;
  end_time: string;
};

type MeetingEntry = {
  id: string;
  title: string | null;
  scheduled_start: string;
  scheduled_end: string;
  daily_room_url: string | null;
  status: "scheduled" | "active" | "ended";
};

interface GroupDetailProps {
  group: {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
  };
  members: MemberWithProfile[];
  dates: DateEntry[];
  slots: SlotEntry[];
  meetings: MeetingEntry[];
  currentUserId: string;
}

export function GroupDetail({
  group,
  members,
  dates,
  slots,
  meetings,
  currentUserId,
}: GroupDetailProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  // Schedule meeting dialog
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingStart, setMeetingStart] = useState("09:00");
  const [meetingEnd, setMeetingEnd] = useState("10:00");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setInviteError(null);

    const result = await inviteMember(group.id, inviteEmail.trim());

    if (result?.error) {
      setInviteError(result.error);
      setIsInviting(false);
    } else {
      setInviteEmail("");
      setInviteOpen(false);
      setIsInviting(false);
    }
  }

  async function handleSchedule() {
    if (!meetingDate || !meetingStart || !meetingEnd) return;
    setIsScheduling(true);
    setScheduleError(null);

    const scheduledStart = new Date(`${meetingDate}T${meetingStart}`).toISOString();
    const scheduledEnd = new Date(`${meetingDate}T${meetingEnd}`).toISOString();

    const result = await createMeeting(
      group.id,
      meetingTitle || "Untitled meeting",
      scheduledStart,
      scheduledEnd
    );

    if (result?.error) {
      setScheduleError(result.error);
      setIsScheduling(false);
    } else {
      setMeetingTitle("");
      setMeetingDate("");
      setMeetingStart("09:00");
      setMeetingEnd("10:00");
      setScheduleOpen(false);
      setIsScheduling(false);
    }
  }

  const activeMeetings = meetings.filter((m) => m.status !== "ended");

  return (
    <div className="flex gap-8">
      {/* Left column — group info, actions, members, meetings */}
      <div className="w-56 shrink-0 space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {group.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {/* Invite dialog */}
          <Dialog
            open={inviteOpen}
            onOpenChange={(open) => {
              setInviteOpen(open);
              if (!open) {
                setInviteEmail("");
                setInviteError(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <UserPlus className="size-3.5" />
                Invite member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a member</DialogTitle>
                <DialogDescription>
                  Enter the email of an existing user to add them to this group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInvite();
                  }}
                />
                {inviteError && (
                  <p className="text-sm text-destructive">{inviteError}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  {isInviting ? "Adding…" : "Add to group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Schedule meeting dialog */}
          <Dialog
            open={scheduleOpen}
            onOpenChange={(open) => {
              setScheduleOpen(open);
              if (!open) {
                setMeetingTitle("");
                setScheduleError(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <CalendarPlus className="size-3.5" />
                Schedule meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a meeting</DialogTitle>
                <DialogDescription>
                  Pick a date and time for the group meeting.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Meeting title (optional)"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
                <Input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Start
                    </label>
                    <Input
                      type="time"
                      value={meetingStart}
                      onChange={(e) => setMeetingStart(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      End
                    </label>
                    <Input
                      type="time"
                      value={meetingEnd}
                      onChange={(e) => setMeetingEnd(e.target.value)}
                    />
                  </div>
                </div>
                {scheduleError && (
                  <p className="text-sm text-destructive">{scheduleError}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSchedule}
                  disabled={isScheduling || !meetingDate}
                >
                  {isScheduling ? "Scheduling…" : "Schedule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members */}
        <div className="space-y-1.5">
          <h2 className="text-sm font-medium text-muted-foreground">
            Members
          </h2>
          <div className="space-y-1">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="flex items-center gap-2 text-sm py-1"
              >
                <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                  {(
                    m.profiles.display_name ||
                    m.profiles.email ||
                    "?"
                  )[0].toUpperCase()}
                </div>
                <span className="truncate">
                  {m.profiles.display_name || m.profiles.email}
                </span>
                {m.role === "owner" && (
                  <Crown className="size-3 text-amber-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meetings list */}
        {activeMeetings.length > 0 && (
          <div className="space-y-1.5">
            <h2 className="text-sm font-medium text-muted-foreground">
              Meetings
            </h2>
            <div className="space-y-1.5">
              {activeMeetings.map((m) => {
                const start = new Date(m.scheduled_start);
                return (
                  <Link
                    key={m.id}
                    href={`/groups/${group.id}/meetings/${m.id}`}
                    className="flex items-start gap-2 rounded-md border px-2.5 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    {m.status === "active" ? (
                      <Video className="size-3.5 mt-0.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {m.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(start, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right column — availability grid */}
      <div className="flex-1 min-w-0">
        {dates.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground py-20 text-sm">
            No candidate dates have been set for this group yet.
          </div>
        ) : (
          <AvailabilityGrid
            groupId={group.id}
            dates={dates}
            members={members}
            slots={slots}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}

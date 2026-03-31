"use client";

import { useState } from "react";
import { UserPlus, Crown } from "lucide-react";
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
import { inviteMember } from "../actions";

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
  currentUserId: string;
}

export function GroupDetail({
  group,
  members,
  dates,
  slots,
  currentUserId,
}: GroupDetailProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

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

  return (
    <div className="flex gap-8">
      {/* Left column — group info & members */}
      <div className="w-56 shrink-0 space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {group.description}
            </p>
          )}
        </div>

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

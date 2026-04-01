"use client";

import { useEffect, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import {
  DailyProvider,
  DailyVideo,
  useParticipantIds,
  useLocalSessionId,
  useMeetingState,
  useDaily,
} from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";

interface VideoCallProps {
  roomUrl: string;
  userName: string;
  onLeave?: () => void;
}

export function VideoCall({ roomUrl, userName, onLeave }: VideoCallProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);

  useEffect(() => {
    const co = DailyIframe.createCallObject({
      url: roomUrl,
      userName,
    });
    setCallObject(co);
    co.join();

    return () => {
      co.leave().then(() => co.destroy());
    };
  }, [roomUrl, userName]);

  if (!callObject) return null;

  return (
    <DailyProvider callObject={callObject}>
      <CallUI onLeave={onLeave} />
    </DailyProvider>
  );
}

function CallUI({ onLeave }: { onLeave?: () => void }) {
  const daily = useDaily();
  const meetingState = useMeetingState();
  const localSessionId = useLocalSessionId();
  const participantIds = useParticipantIds();

  function handleLeave() {
    daily?.leave();
    onLeave?.();
  }

  if (meetingState === "joining-meeting") {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Joining call...
      </div>
    );
  }

  if (meetingState === "error") {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-destructive">
        Failed to join the call. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {participantIds.map((id) => (
          <div
            key={id}
            className="relative aspect-video rounded-lg overflow-hidden bg-muted"
          >
            <DailyVideo
              sessionId={id}
              type="video"
              fit="cover"
              className="h-full w-full object-cover"
            />
            {id === localSessionId && (
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                You
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="destructive" size="sm" onClick={handleLeave}>
          <PhoneOff className="size-3.5" />
          Leave call
        </Button>
      </div>
    </div>
  );
}

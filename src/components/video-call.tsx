"use client";

import { useEffect, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import {
  DailyProvider,
  DailyVideo,
  DailyAudio,
  useParticipantIds,
  useLocalSessionId,
  useMeetingState,
  useDaily,
} from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";

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
  const [muted, setMuted] = useState(false);

  function handleToggleMute() {
    if (!daily) return;
    const newMuted = !muted;
    daily.setLocalAudio(!newMuted);
    setMuted(newMuted);
  }

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

  const count = participantIds.length;

  // Grid layout:
  // 1 → 1 col, 2 → 1 col on mobile / 2 cols on md+, 3-4 → 2 cols, 5-6 → 2 cols, 7+ → 3 cols
  const gridClasses =
    count === 1
      ? "grid-cols-1 max-w-[640px]"
      : count === 2
        ? "grid-cols-1 md:grid-cols-2"
        : count <= 6
          ? "grid-cols-2"
          : "grid-cols-3";

  return (
    <div className="flex flex-col items-center" style={{ height: "calc(100vh - 200px)" }}>
      <DailyAudio />
      <div
        className={`grid gap-2 mx-auto flex-1 min-h-0 w-full place-items-center ${gridClasses}`}
      >
        {participantIds.map((id) => {
          const isLocal = id === localSessionId;
          return (
            <div
              key={id}
              className="relative aspect-video w-full max-h-full rounded-lg overflow-hidden bg-muted"
            >
              <DailyVideo
                sessionId={id}
                type="video"
                fit="cover"
                className="h-full w-full object-cover"
                style={isLocal ? { transform: "scaleX(-1)" } : undefined}
              />
              {isLocal && (
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  You
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 pt-3 shrink-0">
        <Button
          variant={muted ? "secondary" : "outline"}
          size="sm"
          onClick={handleToggleMute}
        >
          {muted ? (
            <MicOff className="size-3.5 text-destructive" />
          ) : (
            <Mic className="size-3.5" />
          )}
          {muted ? "Unmute" : "Mute"}
        </Button>
        <Button variant="destructive" size="sm" onClick={handleLeave}>
          <PhoneOff className="size-3.5" />
          Leave call
        </Button>
      </div>
    </div>
  );
}

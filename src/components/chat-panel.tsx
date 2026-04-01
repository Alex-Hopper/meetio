"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id: string | null;
  is_ai: boolean;
  content: string;
  created_at: string;
  // Joined from profiles
  profiles?: { display_name: string | null; email: string } | null;
}

interface ChatPanelProps {
  meetingId: string;
  currentUserId: string;
  userName: string;
}

export function ChatPanel({
  meetingId,
  currentUserId,
  userName,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  // Load existing messages on mount
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, meeting_id, user_id, is_ai, content, created_at, profiles(display_name, email)")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data as unknown as ChatMessage[]);
      }
    }
    loadMessages();
  }, [meetingId]);

  // Subscribe to broadcast messages from other clients
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${meetingId}`)
      .on("broadcast", { event: "new-message" }, ({ payload }) => {
        const newMsg = payload as ChatMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const content = input.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setInput("");

    // Optimistically add the message
    const optimisticMsg: ChatMessage = {
      id: crypto.randomUUID(),
      meeting_id: meetingId,
      user_id: currentUserId,
      is_ai: false,
      content,
      created_at: new Date().toISOString(),
      profiles: { display_name: userName, email: "" },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const { data } = await supabase
      .from("chat_messages")
      .insert({
        meeting_id: meetingId,
        user_id: currentUserId,
        content,
      })
      .select("id")
      .single();

    // Replace optimistic ID with real ID and broadcast to other clients
    if (data) {
      const savedMsg: ChatMessage = { ...optimisticMsg, id: data.id };
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? savedMsg : m))
      );
      channelRef.current?.send({
        type: "broadcast",
        event: "new-message",
        payload: savedMsg,
      });
    }

    setIsSending(false);
  }

  function getDisplayName(msg: ChatMessage) {
    if (msg.is_ai) return "AI";
    if (msg.user_id === currentUserId) return "You";
    return msg.profiles?.display_name || msg.profiles?.email || "User";
  }

  return (
    <div className="flex flex-col h-full border rounded-lg">
      {/* Header */}
      <div className="px-3 py-2 border-b shrink-0">
        <h2 className="text-sm font-medium">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No messages yet. Say something!
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {getDisplayName(msg)}
                </span>
                <span className="text-[9px] text-muted-foreground/60">
                  {format(new Date(msg.created_at), "h:mm a")}
                </span>
              </div>
              <div
                className={`rounded-lg px-2.5 py-1.5 text-sm max-w-[85%] ${
                  msg.is_ai
                    ? "bg-violet-100 dark:bg-violet-900/30 text-foreground"
                    : isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-1.5"
        >
          <Input
            type="text"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-sm"
          />
          <Button size="icon" type="submit" disabled={!input.trim() || isSending}>
            <Send className="size-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

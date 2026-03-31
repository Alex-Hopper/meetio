"use client";

import { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { format, parse } from "date-fns";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveAvailability } from "@/app/(dashboard)/groups/actions";

// --- Constants ---

const START_HOUR = 8;
const END_HOUR = 22;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES; // 28
const VISIBLE_DATES = 7;

// --- Types ---

type DateEntry = { id: string; date: string };

type MemberEntry = {
  user_id: string;
  role: "owner" | "member";
  profiles: { display_name: string | null; email: string };
};

type SlotEntry = {
  user_id: string;
  group_date_id: string;
  start_time: string;
  end_time: string;
};

interface AvailabilityGridProps {
  groupId: string;
  dates: DateEntry[];
  members: MemberEntry[];
  slots: SlotEntry[];
  currentUserId: string;
}

// --- Helpers ---

function cellKey(dateId: string, slotIndex: number): string {
  return `${dateId}:${slotIndex}`;
}

function getSlotLabel(slotIndex: number): string {
  const totalMinutes = START_HOUR * 60 + slotIndex * SLOT_MINUTES;
  const hour = Math.floor(totalMinutes / 60);
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h} ${period}`;
}

function slotIndexFromUtc(dateStr: string, isoTime: string): number | null {
  const d = new Date(isoTime);
  const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (localDate !== dateStr) return null;

  const hour = d.getHours();
  const minute = d.getMinutes();
  const idx =
    (hour - START_HOUR) * (60 / SLOT_MINUTES) +
    Math.floor(minute / SLOT_MINUTES);
  if (idx < 0 || idx >= TOTAL_SLOTS) return null;
  return idx;
}

function buildCellSet(
  userSlots: SlotEntry[],
  dates: DateEntry[]
): Set<string> {
  const cells = new Set<string>();
  for (const slot of userSlots) {
    const dateEntry = dates.find((d) => d.id === slot.group_date_id);
    if (!dateEntry) continue;
    const idx = slotIndexFromUtc(dateEntry.date, slot.start_time);
    if (idx !== null) cells.add(cellKey(dateEntry.id, idx));
  }
  return cells;
}

// --- Component ---

export function AvailabilityGrid({
  groupId,
  dates,
  members,
  slots,
  currentUserId,
}: AvailabilityGridProps) {
  // View state
  const [viewMode, setViewMode] = useState<string>("self");
  const [pageIndex, setPageIndex] = useState(0);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select");

  // Current user's editable availability
  const [selectedCells, setSelectedCells] = useState<Set<string>>(() =>
    buildCellSet(
      slots.filter((s) => s.user_id === currentUserId),
      dates
    )
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pre-compute other members' cell sets
  const otherMembersMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const member of members) {
      if (member.user_id === currentUserId) continue;
      map.set(
        member.user_id,
        buildCellSet(
          slots.filter((s) => s.user_id === member.user_id),
          dates
        )
      );
    }
    return map;
  }, [members, slots, dates, currentUserId]);

  // Pagination
  const visibleDates = dates.slice(
    pageIndex * VISIBLE_DATES,
    (pageIndex + 1) * VISIBLE_DATES
  );
  const totalPages = Math.ceil(dates.length / VISIBLE_DATES);

  // End drag on global mouseup
  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    document.addEventListener("mouseup", handleUp);
    return () => document.removeEventListener("mouseup", handleUp);
  }, []);

  // --- Drag handlers ---

  const handleMouseDown = useCallback(
    (key: string) => {
      if (viewMode !== "self") return;
      setIsDragging(true);
      const isSelected = selectedCells.has(key);
      setDragMode(isSelected ? "deselect" : "select");
      setSelectedCells((prev) => {
        const next = new Set(prev);
        isSelected ? next.delete(key) : next.add(key);
        return next;
      });
      setIsDirty(true);
    },
    [viewMode, selectedCells]
  );

  const handleMouseEnter = useCallback(
    (key: string) => {
      if (!isDragging || viewMode !== "self") return;
      setSelectedCells((prev) => {
        const next = new Set(prev);
        dragMode === "select" ? next.add(key) : next.delete(key);
        return next;
      });
      setIsDirty(true);
    },
    [isDragging, viewMode, dragMode]
  );

  // --- Save ---

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);

    const slotsToSave: {
      groupDateId: string;
      startTime: string;
      endTime: string;
    }[] = [];

    for (const key of selectedCells) {
      const [dateId, slotIdxStr] = key.split(":");
      const slotIndex = parseInt(slotIdxStr, 10);
      const dateEntry = dates.find((d) => d.id === dateId);
      if (!dateEntry) continue;

      const [year, month, day] = dateEntry.date.split("-").map(Number);
      const totalMinutes = START_HOUR * 60 + slotIndex * SLOT_MINUTES;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;

      const start = new Date(year, month - 1, day, hour, minute);
      const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);

      slotsToSave.push({
        groupDateId: dateId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
    }

    const result = await saveAvailability(groupId, slotsToSave);
    if (result?.error) {
      setSaveError(result.error);
    } else {
      setIsDirty(false);
    }
    setIsSaving(false);
  }

  // --- Cell styling ---

  function getCellClass(dateId: string, slotIndex: number): string {
    const key = cellKey(dateId, slotIndex);

    if (viewMode === "self") {
      return selectedCells.has(key)
        ? "bg-emerald-400/80 dark:bg-emerald-500/70"
        : "bg-muted/40";
    }

    if (viewMode === "overlap") {
      // Count: self + other members
      let count = selectedCells.has(key) ? 1 : 0;
      for (const [, cells] of otherMembersMap) {
        if (cells.has(key)) count++;
      }
      if (count === 0) return "bg-muted/40";
      const ratio = count / members.length;
      if (ratio <= 0.25) return "bg-emerald-200 dark:bg-emerald-900/60";
      if (ratio <= 0.5) return "bg-emerald-300 dark:bg-emerald-700/70";
      if (ratio <= 0.75) return "bg-emerald-400 dark:bg-emerald-600/80";
      return "bg-emerald-500 dark:bg-emerald-500";
    }

    // Viewing a specific other member
    const memberCells = otherMembersMap.get(viewMode);
    return memberCells?.has(key)
      ? "bg-blue-400/70 dark:bg-blue-500/60"
      : "bg-muted/40";
  }

  // --- Render ---

  return (
    <div className="space-y-4">
      {/* View mode selector */}
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="xs"
          variant={viewMode === "self" ? "default" : "outline"}
          onClick={() => setViewMode("self")}
        >
          Your availability
        </Button>
        {members
          .filter((m) => m.user_id !== currentUserId)
          .map((m) => (
            <Button
              key={m.user_id}
              size="xs"
              variant={viewMode === m.user_id ? "default" : "outline"}
              onClick={() => setViewMode(m.user_id)}
            >
              {m.profiles.display_name || m.profiles.email}
            </Button>
          ))}
        <Button
          size="xs"
          variant={viewMode === "overlap" ? "default" : "outline"}
          onClick={() => setViewMode("overlap")}
        >
          Show overlapping
        </Button>
      </div>

      {/* Date pagination */}
      <div className="flex items-center gap-2">
        <Button
          size="icon-xs"
          variant="outline"
          onClick={() => setPageIndex((p) => p - 1)}
          disabled={pageIndex === 0}
        >
          <ChevronLeft />
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {pageIndex + 1} / {totalPages}
        </span>
        <Button
          size="icon-xs"
          variant="outline"
          onClick={() => setPageIndex((p) => p + 1)}
          disabled={pageIndex >= totalPages - 1}
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Grid */}
      <div
        className="select-none"
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className="grid gap-px bg-border/50 rounded-lg overflow-hidden"
          style={{
            gridTemplateColumns: `3.5rem repeat(${visibleDates.length}, 1fr)`,
          }}
        >
          {/* Column headers */}
          <div className="bg-background" />
          {visibleDates.map((d) => (
            <div
              key={d.id}
              className="bg-background text-center text-[11px] font-medium py-2"
            >
              {format(parse(d.date, "yyyy-MM-dd", new Date()), "EEE M/d")}
            </div>
          ))}

          {/* Time rows */}
          {Array.from({ length: TOTAL_SLOTS }).flatMap((_, slotIndex) => [
            <div
              key={`t-${slotIndex}`}
              className={cn(
                "bg-background pr-2 flex items-center justify-end",
                slotIndex % 2 === 0
                  ? "text-[10px] font-medium text-muted-foreground"
                  : "text-transparent text-[0px]"
              )}
              style={{ height: 20 }}
            >
              {slotIndex % 2 === 0 ? getSlotLabel(slotIndex) : null}
            </div>,
            ...visibleDates.map((d) => {
              const key = cellKey(d.id, slotIndex);
              return (
                <div
                  key={key}
                  className={cn(
                    "transition-colors duration-75",
                    getCellClass(d.id, slotIndex),
                    viewMode === "self" &&
                      "cursor-pointer hover:ring-1 hover:ring-foreground/20 hover:z-10"
                  )}
                  style={{ height: 20 }}
                  onMouseDown={() => handleMouseDown(key)}
                  onMouseEnter={() => handleMouseEnter(key)}
                />
              );
            }),
          ])}
        </div>
      </div>

      {/* Save / status */}
      {viewMode === "self" && (
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!isDirty || isSaving} size="sm">
            <Save className="size-3.5" />
            {isSaving ? "Saving…" : isDirty ? "Save availability" : "Saved"}
          </Button>
          {saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}
        </div>
      )}

      {/* Overlap legend */}
      {viewMode === "overlap" && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Fewer available</span>
          <div className="flex gap-0.5">
            <div className="size-4 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
            <div className="size-4 rounded-sm bg-emerald-300 dark:bg-emerald-700/70" />
            <div className="size-4 rounded-sm bg-emerald-400 dark:bg-emerald-600/80" />
            <div className="size-4 rounded-sm bg-emerald-500" />
          </div>
          <span>More available</span>
        </div>
      )}
    </div>
  );
}

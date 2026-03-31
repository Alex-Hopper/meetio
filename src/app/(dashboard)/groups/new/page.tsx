"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createGroup } from "../actions";

const MAX_DATES = 30;

const nameSchema = z.string().min(1, "Group name is required").max(100, "Name is too long");

export default function NewGroupPage() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      if (selectedDates.length === 0) {
        setDateError("Select at least one date.");
        return;
      }
      setDateError(null);
      setServerError(null);

      const dates = selectedDates.map((d) => format(d, "yyyy-MM-dd"));
      const result = await createGroup(value.name, dates);
      if (result?.error) {
        setServerError(result.error);
      }
    },
  });

  function handleDateSelect(dates: Date[] | undefined) {
    if (!dates) return setSelectedDates([]);
    if (dates.length > MAX_DATES) return;
    setSelectedDates(dates);
    if (dates.length > 0) setDateError(null);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">New Group</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Give your group a name and pick the dates you want to find availability for.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="w-fit flex flex-col gap-6"
      >
        <FieldGroup>
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) => {
                const result = nameSchema.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Group name</FieldLabel>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="eg. Design Team"
                  className="w-full"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors.map((e) => ({ message: String(e) }))} />
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-medium">Candidate dates</p>
            <p className="text-xs text-muted-foreground">
              {selectedDates.length} / {MAX_DATES}
            </p>
          </div>

          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateSelect}
            disabled={{ before: new Date() }}
            className="rounded-lg border"
          />

          {dateError && (
            <p className="text-sm text-destructive">{dateError}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create group"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}

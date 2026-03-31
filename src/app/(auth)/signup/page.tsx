"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signup } from "../actions";

const schema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().check(z.email({ error: "Enter a valid email" })),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { displayName: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await signup(value.email, value.password, value.displayName);
      if (result?.error) {
        setServerError(result.error);
      }
    },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
        <p className="text-sm text-muted-foreground">Enter your details to get started</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <FieldGroup>
          <form.Field
            name="displayName"
            validators={{
              onBlur: ({ value }) => {
                const result = schema.shape.displayName.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Display name</FieldLabel>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="eg. Alex"
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors.map((e) => ({ message: String(e) }))} />
              </Field>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => {
                const result = schema.shape.email.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="eg. alex@example.com"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors.map((e) => ({ message: String(e) }))} />
              </Field>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) => {
                const result = schema.shape.password.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  type="password"
                  placeholder="Must be at least 8 characters"
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors.map((e) => ({ message: String(e) }))} />
              </Field>
            )}
          </form.Field>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
        </FieldGroup>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
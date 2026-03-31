import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .single();

  const name = profile?.display_name || profile?.email || "there";

  return (
    <div className="flex min-h-full flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <span className="font-semibold tracking-tight">MeetSync</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{name}</span>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <Separator />
      <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "./actions";
import Link from "next/link";

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
      <header className="max-w-5xl w-full mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={"/dashboard"} className="text-l font-semibold tracking-tight flex gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1000 1000" fill="none">
            <path d="M629.544 166.863C645.75 143.304 680.724 143.865 696.165 167.931L953.026 568.248C970.107 594.87 950.991 629.849 919.36 629.849L771.577 629.849C757.706 629.849 744.825 622.663 737.539 610.86L555.713 316.299C547.387 302.811 547.811 285.678 556.795 272.619L629.544 166.863Z" fill="#1447E6"/>
            <path d="M306.193 178.172C320.955 151.314 359.198 150.354 375.29 176.436L687.65 682.736C695.708 695.797 695.583 712.316 687.328 725.253L617.921 834.037C602.068 858.883 565.702 858.635 550.189 833.575L242.425 336.412C234.831 324.144 234.432 308.737 241.382 296.092L306.193 178.172Z" fill="#1447E6"/>
            <path d="M140.518 412.477C156.89 389.258 191.572 390.032 206.893 413.956L384.799 691.763C393.915 705.998 393.099 724.427 382.76 737.8L308.306 834.107C291.183 856.255 257.19 854.415 242.558 830.548L71.7589 551.943C63.4093 538.324 63.9643 521.042 73.1706 507.986L140.518 412.477Z" fill="#1447E6"/>
          </svg>
          Meetio
        </Link>
        <div className="flex items-center gap-4">
          <Link href={"/dashboard"} className="text-sm text-muted-foreground">{name}</Link>
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

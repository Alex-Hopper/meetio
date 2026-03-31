import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Plus, CalendarDays } from "lucide-react";
import type { Database } from "@/types/database";

type Group = Database["public"]["Tables"]["groups"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const profile = profileData as { display_name: string | null } | null;
  const firstName = profile?.display_name?.split(" ")[0] ?? "there";

  // Step 1: get the group IDs this user belongs to
  const { data: membershipsData } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const memberships = (membershipsData ?? []) as { group_id: string }[];
  const groupIds = memberships.map((m) => m.group_id);

  if (groupIds.length === 0) {
    return <EmptyDashboard firstName={firstName} />;
  }

  // Step 2: fetch groups, member counts, date counts in parallel
  const [{ data: groupsData }, { data: memberCountsData }, { data: dateCountsData }] =
    await Promise.all([
      supabase.from("groups").select("id, name, description, created_at").in("id", groupIds),
      supabase.from("group_members").select("group_id").in("group_id", groupIds),
      supabase.from("group_dates").select("group_id").in("group_id", groupIds),
    ]);

  const groups = (groupsData ?? []) as Group[];
  const memberCounts = (memberCountsData ?? []) as { group_id: string }[];
  const dateCounts = (dateCountsData ?? []) as { group_id: string }[];

  const memberCountMap = memberCounts.reduce<Record<string, number>>(
    (acc, row) => ({ ...acc, [row.group_id]: (acc[row.group_id] ?? 0) + 1 }),
    {}
  );
  const dateCountMap = dateCounts.reduce<Record<string, number>>(
    (acc, row) => ({ ...acc, [row.group_id]: (acc[row.group_id] ?? 0) + 1 }),
    {}
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hey, {firstName}!</h1>
        <p className="text-muted-foreground mt-1">
          Manage your groups and schedule meetings with your team.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Groups</h2>
          <Button asChild size="sm">
            <Link href="/groups/new">
              <Plus className="size-4" />
              New Group
            </Link>
          </Button>
        </div>

        {groups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const members = memberCountMap[group.id] ?? 0;
              const dates = dateCountMap[group.id] ?? 0;
              return (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription className="line-clamp-2">
                          {group.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter className="gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {members} {members === 1 ? "member" : "members"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {dates} {dates === 1 ? "date" : "dates"}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyDashboard({ firstName }: { firstName: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hey, {firstName}!</h1>
        <p className="text-muted-foreground mt-1">
          Manage your groups and schedule meetings with your team.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Groups</h2>
          <Button asChild size="sm">
            <Link href="/groups/new">
              <Plus className="size-4" />
              New Group
            </Link>
          </Button>
        </div>
        <EmptyState />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center py-12">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-2">
          <Users className="size-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-base">No groups yet</CardTitle>
        <CardDescription>
          Create a group to start scheduling with your team.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center pb-10">
        <Button asChild>
          <Link href="/groups/new">
            <Plus className="size-4" />
            Create your first group
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

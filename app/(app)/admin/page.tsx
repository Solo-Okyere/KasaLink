import { CheckCircle2, CircleSlash, ShieldAlert } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { adminProfileAction, updateReportStatusAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase-admin";

export default async function AdminPage() {
  await requireAdmin();
  const service = createServiceClient();
  const [{ data: users }, { data: reports }, { data: actions }] = await Promise.all([
    service
      .from("profiles")
      .select("user_id, username, display_name, email, approval_status, role, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    service
      .from("reports")
      .select("id, reporter_id, reported_id, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    service
      .from("admin_actions")
      .select("id, target_user_id, action, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Admin</p>
        <h1 className="mt-2 text-3xl font-bold">Approvals and moderation</h1>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Card>
          <CardHeader>
            <CardTitle>User moderation</CardTitle>
            <CardDescription>Review accounts and suspend unsafe users. Normal users do not need approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(users ?? []).map((profile: any) => (
              <div key={profile.user_id} className="grid gap-3 rounded-lg border bg-white/70 p-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{profile.display_name ?? profile.username ?? "Incomplete profile"}</h2>
                    <Badge>{profile.approval_status}</Badge>
                    {profile.role === "admin" ? <Badge className="bg-accent">admin</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <form action={adminProfileAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input type="hidden" name="target_user_id" value={profile.user_id} />
                  <Select name="approval_status" defaultValue={profile.approval_status}>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </Select>
                  <Input name="notes" placeholder="Notes" />
                  <Button><CheckCircle2 size={18} /> Save</Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Review open user reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(reports ?? []).map((report: any) => (
                <div key={report.id} className="rounded-lg border bg-white/70 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-destructive" />
                    <Badge>{report.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{report.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Reported: {report.reported_id}</p>
                  <form action={updateReportStatusAction} className="mt-3 flex gap-2">
                    <input type="hidden" name="report_id" value={report.id} />
                    <Select name="status" defaultValue={report.status}>
                      <option value="open">Open</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </Select>
                    <Button variant="outline" size="icon" title="Update report"><CircleSlash size={18} /></Button>
                  </form>
                </div>
              ))}
              {!reports?.length ? <p className="text-sm text-muted-foreground">No reports yet.</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(actions ?? []).map((action: any) => (
                <div key={action.id} className="rounded-md border bg-white/70 p-3 text-sm">
                  <p className="font-medium">{action.action}</p>
                  <p className="text-muted-foreground">{action.target_user_id}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-context";
import { demoProjects, type ProjectStatus } from "@/lib/demo-data";

export async function GET() {
  const auth = await getAdminContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.demo) return NextResponse.json({ projects: demoProjects, mode: "demo" });

  const { data, error } = await auth.supabase!
    .from("projects")
    .select("id,project_code,client_name,company,service,product_name,status,last_activity_at")
    .order("last_activity_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load projects" }, { status: 500 });

  const projects = (data ?? []).map((item) => ({
    id: item.id,
    code: item.project_code,
    client: item.client_name,
    company: item.company || item.client_name,
    service: item.service,
    product: item.product_name,
    status: item.status as ProjectStatus,
    lastActivity: new Date(item.last_activity_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));
  return NextResponse.json({ projects });
}

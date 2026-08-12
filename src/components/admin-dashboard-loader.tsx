"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { ProjectSummary } from "@/lib/demo-data";
import { AdminDashboard } from "./admin-dashboard";

export function AdminDashboardLoader() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/projects")
      .then(async (response) => {
        if (response.status === 401) {
          await router.replace("/admin/login");
          return null;
        }
        if (!response.ok) throw new Error("Unable to load projects");
        return response.json();
      })
      .then((payload) => {
        if (active && payload) setProjects(payload.projects);
      })
      .catch(() => {
        if (active) setProjects([]);
      });
    return () => { active = false; };
  }, [router]);

  if (!projects) return <main className="admin-main"><div className="shell"><p>Loading projects…</p></div></main>;
  return <AdminDashboard projects={projects} />;
}

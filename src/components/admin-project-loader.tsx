"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AdminProject, type AdminProjectData } from "./admin-project";

export function AdminProjectLoader({ code }: { code: string }) {
  const router = useRouter();
  const [project, setProject] = useState<AdminProjectData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/projects/${encodeURIComponent(code)}`)
      .then(async (response) => {
        if (response.status === 401) {
          await router.replace("/admin/login");
          return null;
        }
        if (!response.ok) throw new Error("Unable to load project");
        return response.json();
      })
      .then((payload) => {
        if (active && payload) setProject(payload.project);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, [code, router]);

  if (failed) return <main className="admin-project-main"><div className="shell"><p>Project could not be loaded.</p></div></main>;
  if (!project) return <main className="admin-project-main"><div className="shell"><p>Loading project…</p></div></main>;
  return <AdminProject initialProject={project} />;
}

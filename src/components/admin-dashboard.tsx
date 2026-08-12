"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import type { ProjectSummary, ProjectStatus } from "@/lib/demo-data";
import { useLocale } from "./locale-provider";

const statuses: (ProjectStatus | "All statuses")[] = ["All statuses", "Request Received", "Under Review", "In Design", "Waiting for Client", "Completed"];

export function AdminDashboard({ projects }: { projects: ProjectSummary[] }) {
  const { pick } = useLocale();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All statuses");
  const filtered = useMemo(() => projects.filter((project) => {
    const matchStatus = status === "All statuses" || project.status === status;
    const haystack = `${project.code} ${project.company} ${project.client} ${project.product}`.toLowerCase();
    return matchStatus && haystack.includes(search.toLowerCase());
  }), [projects, search, status]);

  return (
    <main className="admin-main">
      <div className="shell">
        <h1 className="admin-title">{pick("Projects", "Projeler")}</h1>
        <p className="admin-subtitle">{pick("View and manage project requests.", "Proje taleplerini görüntüleyin ve yönetin.")}</p>
        <div className="admin-tools">
          <div className="search-box"><MagnifyingGlass size={22} /><input className="input" aria-label="Search projects" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={pick("Search by Project ID, client or product", "Proje kimliği, müşteri veya ürüne göre ara")} /></div>
          <div className="field"><label htmlFor="statusFilter">{pick("Status", "Durum")}</label><select className="select" id="statusFilter" value={status} onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
        </div>
        <div className="table-scroll">
          <table className="projects-table">
            <thead><tr><th>Project ID</th><th>{pick("Client", "Müşteri")}</th><th>{pick("Service", "Hizmet")}</th><th>{pick("Product", "Ürün")}</th><th>{pick("Status", "Durum")}</th><th>{pick("Last Activity", "Son Aktivite")}</th></tr></thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} tabIndex={0} onClick={() => router.push(`/admin/projects/${project.code.toLowerCase()}`)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(`/admin/projects/${project.code.toLowerCase()}`); }} aria-label={`Open ${project.code}`}>
                  <td>{project.code}</td><td>{project.company}</td><td>{project.service}</td><td>{project.product}</td><td><span className={`status-pill ${project.status === "Request Received" || project.status === "In Design" ? "is-orange" : ""}`}>{project.status}</span></td><td>{project.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

import { useRouter } from "next/router";
import { AdminHeader } from "@/components/admin-header";
import { AdminProjectLoader } from "@/components/admin-project-loader";

export default function AdminProjectPage() {
  const router = useRouter();
  const code = typeof router.query.code === "string" ? router.query.code : "";
  return <><AdminHeader />{code ? <AdminProjectLoader code={code} /> : null}</>;
}

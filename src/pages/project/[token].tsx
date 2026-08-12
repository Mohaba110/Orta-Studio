import { CustomerProject } from "@/components/customer-project";
import { useRouter } from "next/router";

export default function CustomerProjectPage() {
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";
  return token ? <CustomerProject token={token} /> : null;
}

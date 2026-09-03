import { redirect } from "next/navigation";

/**
 * /dashboard now redirects to /intelligence — the post-login landing page.
 * Kept so any bookmarked or hard-coded /dashboard links still work.
 */
export default function DashboardPage() {
  redirect("/intelligence");
}

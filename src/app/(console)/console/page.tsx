import { redirect } from "next/navigation";

/** Legacy ops console hub — Ascend platform clone lives at /platform. */
export default function ConsoleHubPage() {
  redirect("/platform");
}

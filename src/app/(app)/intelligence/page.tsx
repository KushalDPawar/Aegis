import { redirect } from "next/navigation";

/** Legacy post-login hub — Ascend platform clone lives at /platform. */
export default function IntelligenceCentrePage() {
  redirect("/platform");
}

import { requirePlatformUser } from "@/lib/auth/platform-user";
import { PlatformShell } from "@/platform/PlatformShell";

export const dynamic = "force-dynamic";

export default async function PlatformPage() {
  const sessionUser = await requirePlatformUser();
  return <PlatformShell sessionUser={sessionUser} />;
}

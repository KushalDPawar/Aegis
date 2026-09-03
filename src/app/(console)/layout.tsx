import { redirect } from "next/navigation";

/** Entire legacy console surface maps to the Ascend platform clone. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  void children;
  redirect("/platform");
}

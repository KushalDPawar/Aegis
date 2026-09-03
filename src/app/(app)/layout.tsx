import { requireCustomer } from "@/lib/auth/guard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, account } = await requireCustomer();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar fullName={profile.fullName} balance={account.balance} accountStatus={account.status} />
        <main id="main-content" className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { requireCustomer } from "@/lib/auth/guard";
import { listTrustedContacts } from "@/lib/queries/trusted";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { TrustedContactList } from "./TrustedContactList";
import { AddTrustedContactForm } from "./AddTrustedContactForm";

export default async function TrustedCirclePage() {
  const { account } = await requireCustomer();
  const contacts = await listTrustedContacts(account.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Trusted Circle</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">Family & trusted contacts</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm max-w-xl">
          When a payment is paused for critical risk, a trusted contact can review it and, with your consent,
          approve or keep it paused — entirely inside this simulation.
        </p>
      </div>

      <Panel className="rise" style={{ animationDelay: "80ms" }}>
        <PanelHeader eyebrow="Circle" title={`${contacts.length} trusted contact${contacts.length === 1 ? "" : "s"}`} />
        <TrustedContactList contacts={contacts} />
      </Panel>

      <Panel className="rise" style={{ animationDelay: "140ms" }}>
        <PanelHeader eyebrow="Add" title="Add a trusted contact" />
        <p className="text-xs text-cream-100/45 mb-4 -mt-2">
          Tip: to see the reviewer experience, add <span className="font-mono text-cream-100/70">priya@aegisdemo.in</span> (seeded demo trusted-contact account).
        </p>
        <AddTrustedContactForm />
      </Panel>
    </div>
  );
}

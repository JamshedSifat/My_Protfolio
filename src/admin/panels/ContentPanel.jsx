import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Toast } from "../ui";

/**
 * Generic repeater used for stats, capabilities, experience entries and
 * highlight lists — keeps the editors declarative instead of duplicated.
 */
export function ListEditor({ label, items, onChange, fields, makeEmpty }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium tracking-[0.02em] text-muted">{label}</p>
        <Button size="sm" variant="secondary" icon={Plus} onClick={() => onChange([...items, makeEmpty()])}>
          Add
        </Button>
      </div>

      {items.map((item, index) => (
        <div key={item.id ?? index} className="rounded-xl border border-line bg-bg/40 p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted">{`#${index + 1}`}</span>
            <button
              type="button"
              aria-label={`Remove entry ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                <Field
                  label={f.label}
                  rows={f.rows}
                  value={item[f.key] ?? ""}
                  onChange={(v) => {
                    const next = [...items];
                    next[index] = { ...next[index], [f.key]: v };
                    onChange(next);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export default function ContentPanel({ content, save, notify }) {
  const [tab, setTab] = useState("hero");
  const [draft, setDraft] = useState(content);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const flash = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const commit = async () => {
    setSaving(true);
    try {
      await save(draft);
      flash("Content published");
    } catch (error) {
      flash(error.message || "Content could not be published");
    } finally {
      setSaving(false);
    }
  };

  const setProfile = (key) => (v) => setDraft((d) => ({ ...d, profile: { ...d.profile, [key]: v } }));

  return (
    <div className="space-y-5">
      <Toast message={toast} />

      <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
              tab === t.id ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {tab === t.id ? (
              <span className="absolute inset-0 rounded-lg bg-accent/14 ring-1 ring-accent/25" aria-hidden="true" />
            ) : null}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "hero" ? (
        <Card title="Hero" description="The first thing visitors read">
          <div className="space-y-4">
            <Field label="Name" value={draft.profile.name} onChange={setProfile("name")} />
            <Field label="Role" value={draft.profile.role} onChange={setProfile("role")} />
            <Field
              label="Professional statement"
              rows={3}
              value={draft.profile.statement}
              onChange={setProfile("statement")}
              hint="Shown under the role in the hero and as the résumé summary."
            />
            <Field label="Availability badge" value={draft.profile.availability} onChange={setProfile("availability")} />
            <Field label="Location" value={draft.profile.location} onChange={setProfile("location")} />

            <ListEditor
              label="Hero stats"
              items={draft.stats}
              onChange={(stats) => setDraft((d) => ({ ...d, stats }))}
              makeEmpty={() => ({ value: "0", label: "New metric" })}
              fields={[
                { key: "value", label: "Value" },
                { key: "label", label: "Label" },
              ]}
            />
          </div>
        </Card>
      ) : null}

      {tab === "about" ? (
        <Card title="About" description="Editorial introduction and highlight cards">
          <div className="space-y-4">
            <Field label="Portrait image URL" value={draft.profile.portrait ?? ""} onChange={setProfile("portrait")} hint="Upload in Settings → Media to get a Cloudinary URL." />
            <Field label="Introduction — paragraph 1" rows={4} value={draft.profile.aboutIntro ?? ""} onChange={setProfile("aboutIntro")} />
            <Field label="Introduction — paragraph 2" rows={4} value={draft.profile.aboutBody ?? ""} onChange={setProfile("aboutBody")} />
            <ListEditor
              label="Focus areas"
              items={(draft.profile.focusAreas ?? []).map((t, i) => ({ id: `focus-${i}`, text: t }))}
              onChange={(list) => setProfile("focusAreas")(list.map((x) => x.text))}
              makeEmpty={() => ({ id: `focus-new-${Date.now()}`, text: "" })}
              fields={[{ key: "text", label: "Label", full: true }]}
            />
            <ListEditor
              label="Highlight cards"
              items={draft.capabilities}
              onChange={(capabilities) => setDraft((d) => ({ ...d, capabilities }))}
              makeEmpty={() => ({ title: "New card", body: "", meta: "" })}
              fields={[
                { key: "title", label: "Title" },
                { key: "meta", label: "Footer note" },
                { key: "body", label: "Body", full: true, rows: 3 },
              ]}
            />
          </div>
        </Card>
      ) : null}

      {tab === "skills" ? (
        <Card title="Tech stack" description="Floating category panels on the public site">
          <div className="space-y-4">
            {draft.stack.map((group, gi) => (
              <div key={group.group} className="rounded-xl border border-line bg-bg/40 p-4">
                <Field
                  label="Category name"
                  value={group.group}
                  onChange={(v) => {
                    const next = [...draft.stack];
                    next[gi] = { ...next[gi], group: v };
                    setDraft((d) => ({ ...d, stack: next }));
                  }}
                />
                <div className="mt-3">
                  <ListEditor
                    label="Items"
                    items={group.items}
                    onChange={(items) => {
                      const next = [...draft.stack];
                      next[gi] = { ...next[gi], items };
                      setDraft((d) => ({ ...d, stack: next }));
                    }}
                    makeEmpty={() => ({ name: "", note: "" })}
                    fields={[
                      { key: "name", label: "Name" },
                      { key: "note", label: "Note" },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {tab === "experience" ? (
        <Card title="Experience" description="Roles shown in the admin and used for the résumé">
          <ListEditor
            label="Positions"
            items={draft.experience}
            onChange={(experience) => setDraft((d) => ({ ...d, experience }))}
            makeEmpty={() => ({ role: "", company: "", period: "", summary: "", points: [] })}
            fields={[
              { key: "role", label: "Role" },
              { key: "company", label: "Company" },
              { key: "period", label: "Period" },
              { key: "summary", label: "Summary", full: true, rows: 2 },
            ]}
          />
        </Card>
      ) : null}

      {tab === "contact" ? (
        <Card title="Contact" description="Channels and form delivery">
          <div className="space-y-4">
            <Field label="Email" value={draft.profile.email} onChange={setProfile("email")} />
            <Field label="GitHub URL" value={draft.profile.github} onChange={setProfile("github")} />
            <Field label="GitHub username" value={draft.profile.githubUser} onChange={setProfile("githubUser")} />
            <Field label="LinkedIn URL" value={draft.profile.linkedin} onChange={setProfile("linkedin")} />

            <div className="rounded-xl border border-line bg-bg/40 p-4">
              <p className="mb-3 text-[12px] font-medium tracking-[0.02em] text-muted">EmailJS delivery</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {["serviceId", "templateId", "publicKey"].map((key) => (
                  <Field
                    key={key}
                    label={key}
                    monospace
                    value={draft.emailjs?.[key] ?? ""}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, emailjs: { ...(d.emailjs ?? {}), [key]: v } }))
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-muted">
                Leaving these blank makes the form simulate success — useful for demos.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="sticky bottom-4 flex justify-end gap-2 rounded-xl border border-line bg-surface/80 p-3 backdrop-blur-xl elevate-2">
        <Button variant="ghost" onClick={() => setDraft(content)}>
          Discard
        </Button>
        <Button loading={saving} onClick={commit}>Publish changes</Button>
      </div>
    </div>
  );
}

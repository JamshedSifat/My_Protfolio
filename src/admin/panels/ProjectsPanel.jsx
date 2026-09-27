import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ArrowDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, Card, Field, Toast } from "../ui";
import { uid } from "../../utils/store";

const BLANK = {
  id: "",
  title: "",
  tagline: "",
  description: "",
  highlights: [],
  tech: [],
  image: "",
  demo: "",
  repo: "",
};

export default function ProjectsPanel({ content, save, notify }) {
  const [list, setList] = useState(content.projects);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const flash = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const move = (index, dir) => {
    const next = [...list];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setList(next);
  };

  const remove = (id) => {
    setList(list.filter((p) => p.id !== id));
    flash("Project removed — remember to publish");
  };

  const persist = async () => {
    setSaving(true);
    try {
      await save({ projects: list });
      setEditing(null);
      flash("Projects published");
    } catch (error) {
      flash(error.message || "Projects could not be published");
    } finally {
      setSaving(false);
    }
  };

  const toList = (value) => String(value ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-5">
      <Toast message={toast} />

      <Card
        title="Projects"
        description="Drag-free reordering with the arrow controls. Changes go live on publish."
        actions={
          <Button icon={Plus} onClick={() => setEditing({ ...BLANK, id: uid(), isNew: true })}>
            New project
          </Button>
        }
      >
        <ul className="space-y-3">
          {list.map((project, index) => (
            <li
              key={project.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-bg/40 p-3"
            >
              <img
                src={project.image}
                alt=""
                className="h-12 w-16 shrink-0 rounded-lg object-cover ring-1 ring-line"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{project.title || "Untitled"}</p>
                <p className="truncate text-[12px] text-muted">{project.tech?.join(" · ") || "No stack"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" aria-label="Move up" onClick={() => move(index, -1)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink">
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button type="button" aria-label="Move down" onClick={() => move(index, 1)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink">
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button type="button" aria-label={`Edit ${project.title}`} onClick={() => setEditing({ ...project })} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-accent">
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
                <button type="button" aria-label={`Delete ${project.title}`} onClick={() => remove(project.id)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <Button loading={saving} onClick={persist}>Publish projects</Button>
        </div>
      </Card>

      <AnimatePresence>
        {editing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={editing.isNew ? "Create project" : "Edit project"}
              className="w-full max-w-2xl rounded-2xl border border-line bg-surface p-6 elevate-4"
            >
              <header className="mb-5 flex items-center justify-between">
                <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-ink">
                  {editing.isNew ? "New project" : "Edit project"}
                </h2>
                <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Tagline" value={editing.tagline} onChange={(v) => setEditing({ ...editing, tagline: v })} />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Description" rows={4} value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Highlights"
                    rows={3}
                    hint="One per line"
                    value={(editing.highlights ?? []).join("\n")}
                    onChange={(v) => setEditing({ ...editing, highlights: toList(v) })}
                  />
                </div>
                <Field
                  label="Technologies"
                  hint="Comma separated"
                  value={(editing.tech ?? []).join(", ")}
                  onChange={(v) => setEditing({ ...editing, tech: toList(v.replace(/,/g, "\n")) })}
                />
                <Field label="Image URL" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} />
                <Field label="Live demo URL" value={editing.demo} onChange={(v) => setEditing({ ...editing, demo: v })} />
                <Field label="Repository URL" value={editing.repo} onChange={(v) => setEditing({ ...editing, repo: v })} />
              </div>

              <footer className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const exists = list.some((p) => p.id === editing.id);
                    setList(exists ? list.map((p) => (p.id === editing.id ? editing : p)) : [...list, editing]);
                    flash(exists ? "Saved locally — publish to apply" : "Project added — publish to apply");
                    setEditing(null);
                  }}
                >
                  Save project
                </Button>
              </footer>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

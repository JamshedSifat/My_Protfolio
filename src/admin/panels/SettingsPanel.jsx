import { useEffect, useState } from "react";
import { FileText, RotateCcw, Search } from "lucide-react";
import { Button, Card, DropZone, Field, Select, Toast, Toggle } from "../ui";
import { apiConfigured, mediaApi, resumeApi } from "../../utils/api";
import { KEYS, read, remove } from "../../utils/store";
import { downloadResume } from "../../utils/resume";

export default function SettingsPanel({ content, save, reset, notify }) {
  const [seo, setSeo] = useState(content.seo);
  const [settings, setSettings] = useState(content.settings);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState("ok");
  const [resume, setResume] = useState(() => read(KEYS.resume, null));
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!apiConfigured) return;
    resumeApi
      .list()
      .then((items) => setResume(items.find((item) => item.is_active) ?? null))
      .catch((error) => flash(error.message, "error"));
  }, []);

  const flash = (message, t = "ok") => {
    setTone(t);
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const handleUpload = async (file, kind) => {
    setBusy(kind);
    try {
      const result = kind === "resume" ? await resumeApi.upload(file) : await mediaApi.upload(file);
      if (kind === "resume") {
        setResume(result);
        flash("Résumé uploaded");
      } else {
        await navigator.clipboard.writeText(result.url).catch(() => {});
        flash(`Image uploaded — URL copied (${(result.bytes / 1024).toFixed(0)} KB)`);
      }
    } catch (error) {
      flash(error.message, "error");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-5">
      <Toast message={toast} tone={tone} />

      <Card
        title="SEO"
        description="Metatags are applied from here and from index.html"
        actions={
          <Button
            size="sm"
            onClick={async () => {
              try {
                await save({ seo });
                applyDocumentMeta(seo);
                flash("SEO settings published");
              } catch (error) {
                flash(error.message, "error");
              }
            }}
          >
            Publish SEO
          </Button>
        }
      >
        <div className="space-y-4">
          <Field label="Page title" value={seo.title} onChange={(v) => setSeo({ ...seo, title: v })} />
          <Field label="Meta description" rows={3} value={seo.description} onChange={(v) => setSeo({ ...seo, description: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Canonical URL" value={seo.canonical} onChange={(v) => setSeo({ ...seo, canonical: v })} />
            <Field label="OG image path" value={seo.ogImage} onChange={(v) => setSeo({ ...seo, ogImage: v })} />
          </div>
          <Toggle
            label="Allow search indexing"
            hint="Off adds noindex and blocks crawlers"
            checked={seo.indexable !== false}
            onChange={(v) => setSeo({ ...seo, indexable: v })}
          />
        </div>
      </Card>

      <Card
        title="Theme & appearance"
        description="Site-wide presentation defaults"
        actions={
          <Button size="sm" onClick={async () => {
            try {
              await save({ settings });
              flash("Settings published");
            } catch (error) {
              flash(error.message, "error");
            }
          }}>
            Publish
          </Button>
        }
      >
        <div className="space-y-3">
          <Select
            label="Default theme for first-time visitors"
            value={settings.defaultTheme}
            onChange={(v) => setSettings({ ...settings, defaultTheme: v })}
            options={[
              { value: "system", label: "Match system preference" },
              { value: "dark", label: "Always dark" },
              { value: "light", label: "Always light" },
            ]}
          />
          <Field
            label="Accent colour"
            type="color"
            value={settings.accent}
            onChange={(v) => setSettings({ ...settings, accent: v })}
            hint="Apple Electric Blue by default. Changing this affects every accent on the site."
          />
          <div className="divide-y divide-line">
            <Toggle label="Show GitHub section" checked={settings.showGitHub} onChange={(v) => setSettings({ ...settings, showGitHub: v })} />
            <Toggle label="Show contribution heatmap" checked={settings.showHeatmap} onChange={(v) => setSettings({ ...settings, showHeatmap: v })} />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              document.documentElement.style.setProperty("--color-accent", settings.accent);
              flash("Accent previewed — publish to persist");
            }}
          >
            Preview accent
          </Button>
        </div>
      </Card>

      <Card title="Media" description="Uploads go to Cloudinary when configured">
        {!apiConfigured ? (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3.5 text-[12.5px] leading-relaxed text-amber-600 dark:text-amber-400">
            The TypeScript API is not configured. Set <code className="font-mono">VITE_API_URL</code>; Cloudinary credentials stay securely on the backend.
          </div>
        ) : null}

        <div className="space-y-4">
          <DropZone
            label="Project / portrait image"
            accept="image/*"
            current={undefined}
            busy={busy === "image"}
            hint="JPG, PNG or WebP · URL is copied to your clipboard"
            onFile={(file) => handleUpload(file, "image")}
          />
          <DropZone
            label="Résumé PDF"
            accept="application/pdf"
            current={resume?.url}
            busy={busy === "resume"}
            hint={resume ? `Stored: ${resume.name}` : "Overrides the generated résumé on all download buttons"}
            onFile={(file) => handleUpload(file, "resume")}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={FileText}
              disabled={!resume?.url}
              onClick={() => window.open(resume.url, "_blank", "noopener")}
            >
              View uploaded PDF
            </Button>
            <Button size="sm" variant="ghost" icon={Search} onClick={() => downloadResume(content.profile)}>
              Preview generated PDF
            </Button>
            {resume ? (
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  if (apiConfigured) await resumeApi.remove(resume.id);
                  else remove(KEYS.resume);
                  setResume(null);
                  flash("Uploaded résumé removed");
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <Card title="Danger zone" description="Reverts every content override to the bundled defaults">
        <Button
          variant="danger"
          icon={RotateCcw}
          onClick={async () => {
            await reset();
            remove(KEYS.resume);
            setResume(null);
            notify("All content reset to defaults");
            window.setTimeout(() => window.location.reload(), 700);
          }}
        >
          Reset all content
        </Button>
      </Card>
    </div>
  );
}

/** Applies SEO fields to the live document so edits are verifiable instantly. */
function applyDocumentMeta(seo) {
  document.title = seo.title;
  const set = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', "content", seo.description);
  set('meta[property="og:title"]', "content", seo.title);
  set('meta[property="og:description"]', "content", seo.description);
  set('meta[name="robots"]', "content", seo.indexable === false ? "noindex, nofollow" : "index, follow");
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = seo.canonical;
}

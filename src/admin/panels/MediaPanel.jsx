import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, ImageIcon, Trash2, Upload } from "lucide-react";
import { Button, Card, Toast } from "../ui";
import { apiConfigured, mediaApi } from "../../utils/api";
import { copyText } from "../../utils/vcard";
import { KEYS, read, write } from "../../utils/store";
import { EASE } from "../../utils/motion";

const LIBRARY_KEY = KEYS.resume ? `${KEYS.resume}.library` : "sp.v1.resume.library";

export default function MediaPanel({ notify }) {
  const [items, setItems] = useState(() => read(LIBRARY_KEY, []));
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState("ok");

  useEffect(() => {
    if (!apiConfigured) return;
    mediaApi.list().then(setItems).catch((error) => flash(error.message, "error"));
  }, []);

  const flash = (message, t = "ok") => {
    setTone(t);
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const onFiles = async (files) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    setBusy(true);
    try {
      const uploaded = [];
      for (const file of list) {
        if (!apiConfigured) throw new Error("Configure VITE_API_URL to upload media.");
        uploaded.push(await mediaApi.upload(file));
      }
      const next = [...uploaded, ...items].slice(0, 40);
      setItems(next);
      write(LIBRARY_KEY, next);
      flash(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      flash(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (apiConfigured) await mediaApi.remove(id);
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    write(LIBRARY_KEY, next);
  };

  return (
    <div className="space-y-5">
      <Toast message={toast} tone={tone} />

      <Card
        title="Media library"
        description="Uploads go straight to Cloudinary. Copy any URL into a project image field."
        actions={
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted">
            {items.length} asset{items.length === 1 ? "" : "s"}
          </span>
        }
      >
        {!apiConfigured ? (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3.5 text-[12.5px] leading-relaxed text-amber-600 dark:text-amber-400">
            The TypeScript API is not configured. Cloudinary credentials remain securely on the backend.
          </div>
        ) : null}

        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center transition-colors duration-200 ${
            busy ? "border-accent/40 bg-accent/5" : "border-line-strong bg-bg/40 hover:border-accent/50"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2/80 text-accent ring-1 ring-line">
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            ) : (
              <Upload className="h-5 w-5" strokeWidth={1.7} />
            )}
          </span>
          <span className="text-[14px] font-medium text-ink">
            {busy ? "Uploading…" : "Drop images here or click to browse"}
          </span>
          <span className="text-[12px] text-muted">JPG, PNG or WebP · multiple files supported</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </Card>

      {items.length ? (
        <Card title="Uploaded" description="Click copy to put the URL on your clipboard">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(0.3, 0.04 * i) }}
                className="group relative overflow-hidden rounded-xl border border-line bg-bg/40"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-3">
                  <p className="truncate text-[12.5px] font-medium text-ink">{item.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted">
                    {((item.bytes ?? 0) / 1024).toFixed(0)} KB
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label={`Copy URL for ${item.name}`}
                    onClick={async () => {
                      const ok = await copyText(item.url);
                      flash(ok ? "URL copied" : "Copy failed", ok ? "ok" : "error");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-muted backdrop-blur-md transition-colors hover:text-accent"
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => remove(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-muted backdrop-blur-md transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <ImageIcon className="h-6 w-6 text-muted/60" strokeWidth={1.6} />
            <p className="text-[13.5px] text-muted">No media yet.</p>
            <Button size="sm" variant="secondary" onClick={() => notify("Use the upload area above")}>
              Upload images
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

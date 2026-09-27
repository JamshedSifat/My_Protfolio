import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, Inbox as InboxIcon, Mail, Trash2 } from "lucide-react";
import { Button, Card } from "../ui";
import { apiConfigured, contactApi } from "../../utils/api";
import { deleteMessage, formatDate, getMessages, markAllRead, markMessageRead, relativeTime } from "../../utils/store";

export default function InboxPanel({ notify }) {
  const [messages, setMessages] = useState(getMessages());
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(apiConfigured);
  const [error, setError] = useState("");

  const load = async () => {
    if (!apiConfigured) return setMessages(getMessages());
    try {
      setMessages(await contactApi.list());
      setError("");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 10000);
    return () => window.clearInterval(id);
  }, []);

  const visible = messages.filter((message) => filter !== "unread" || !message.read);
  const unread = messages.filter((message) => !message.read).length;

  const toggleRead = async (message) => {
    if (apiConfigured) {
      const updated = await contactApi.update(message.id, !message.read);
      setMessages((current) => current.map((item) => (item.id === message.id ? updated : item)));
    } else {
      markMessageRead(message.id, !message.read);
      setMessages(getMessages());
    }
  };

  const readAll = async () => {
    if (apiConfigured) {
      await contactApi.markAllRead();
      setMessages((current) => current.map((message) => ({ ...message, read: true })));
    } else {
      markAllRead();
      setMessages(getMessages());
    }
    notify("All messages marked as read");
  };

  const removeMessage = async (id) => {
    if (apiConfigured) {
      await contactApi.remove(id);
      setMessages((current) => current.filter((item) => item.id !== id));
    } else {
      deleteMessage(id);
      setMessages(getMessages());
    }
  };

  return (
    <div className="space-y-5">
      <Card
        title="Inbox"
        description={`${messages.length} message${messages.length === 1 ? "" : "s"} · ${unread} unread`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line p-0.5">
              {["all", "unread"].map((key) => (
                <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium capitalize ${filter === key ? "bg-accent/14 text-accent" : "text-muted hover:text-ink"}`}>
                  {key}
                </button>
              ))}
            </div>
            <Button size="sm" variant="secondary" icon={CheckCheck} disabled={!unread} onClick={readAll}>Mark all read</Button>
          </div>
        }
      >
        {error ? (
          <p role="alert" className="py-10 text-center text-[13.5px] text-red-500">{error}</p>
        ) : loading ? (
          <p className="py-10 text-center text-[13.5px] text-muted">Loading messages…</p>
        ) : visible.length ? (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {visible.map((message) => (
                <motion.li key={message.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className={`rounded-xl border p-4 ${message.read ? "border-line bg-bg/30" : "border-accent/25 bg-accent/[0.06]"}`}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2/80 text-muted"><Mail className="h-3.5 w-3.5" strokeWidth={1.9} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-[13.5px] font-medium text-ink">{message.name}</p>
                        <a href={`mailto:${message.email}`} className="text-[12.5px] text-accent hover:underline">{message.email}</a>
                        <span className="text-[11.5px] text-muted">· {relativeTime(message.createdAt)}</span>
                        {!message.read ? <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">New</span> : null}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-muted">{message.message}</p>
                      <p className="mt-2.5 font-mono text-[11px] text-muted/70">{formatDate(message.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" onClick={() => toggleRead(message)} className="rounded-lg px-2 py-1 text-[11.5px] text-muted hover:bg-surface-2 hover:text-ink">Mark {message.read ? "unread" : "read"}</button>
                      <button type="button" aria-label="Delete message" onClick={() => removeMessage(message.id)} className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} /></button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <InboxIcon className="h-6 w-6 text-muted/60" strokeWidth={1.6} />
            <p className="text-[13.5px] text-muted">{filter === "unread" ? "Inbox zero — nothing unread." : "No messages yet."}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
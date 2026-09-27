import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { ArrowUpRight, CalendarPlus, Check, Copy, Loader2, Mail, Send, UserPlus } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../components/icons";
import { copyText, downloadVCard } from "../utils/vcard";
import { trackResumeDownload } from "../utils/analytics";
import { useContent } from "../context/ContentContext";
import { addMessage } from "../utils/store";
import { apiConfigured, contactApi } from "../utils/api";
import { Magnetic } from "../components/Button";
import { EASE } from "../utils/motion";
import { cn } from "../utils/cn";

function Field({ label, name, type = "text", textarea = false, required = true, autoComplete }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const float = focused || value.length > 0;

  const validate = (v) => {
    if (required && !v.trim()) return "This field is required.";
    if (name === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address.";
    return "";
  };

  const shared = {
    id,
    name,
    value,
    required,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    onFocus: () => setFocused(true),
    onBlur: (e) => {
      setFocused(false);
      setError(validate(e.target.value));
    },
    onChange: (e) => {
      setValue(e.target.value);
      if (error) setError(validate(e.target.value));
    },
    className: cn(
      "peer w-full resize-none rounded-2xl border bg-surface/50 px-4 pt-6 pb-2.5 text-[15px] leading-relaxed text-ink outline-none transition-[border-color,box-shadow,background-color] duration-300",
      "placeholder:text-transparent",
      error
        ? "border-red-400/60 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.14)]"
        : "border-line hover:border-line-strong focus:border-accent/70 focus:bg-surface/80 focus:shadow-[0_0_0_4px_rgba(10,132,255,0.14)]",
    ),
  };

  return (
    <div className="relative">
      {textarea ? <textarea rows={5} {...shared} /> : <input type={type} autoComplete={autoComplete} {...shared} />}

      <motion.label
        htmlFor={id}
        initial={false}
        animate={{
          y: float ? -9 : 0,
          scale: float ? 0.8 : 1,
          color: focused ? "var(--color-accent)" : "var(--muted)",
        }}
        transition={{ duration: 0.28, ease: EASE }}
        style={{ originX: 0 }}
        className={cn(
          "pointer-events-none absolute top-[19px] left-4 select-none text-[15px] font-medium tracking-[-0.01em]",
          float && "top-[11px]",
        )}
      >
        {label}
      </motion.label>

      <AnimatePresence>
        {error ? (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 pl-1 text-[12px] text-red-500"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const { profile, emailjs: emailjsConfig } = useContent();
  const formRef = useRef(null);
  const [state, setState] = useState("idle");

  const socials = [
    { href: profile.github, Icon: GithubIcon, label: "GitHub", handle: `@${profile.githubUser}` },
    { href: profile.linkedin, Icon: LinkedinIcon, label: "LinkedIn", handle: profile.linkedin.split("/").filter(Boolean).slice(-2).join("/") },
    { href: `mailto:${profile.email}`, Icon: Mail, label: "Email", handle: profile.email },
  ]; // idle | sending | sent | error

  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  const handleCopyEmail = async () => {
    const ok = await copyText(profile.email);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVCard = () => {
    downloadVCard(profile);
    notify?.("Contact card downloaded");
  };

  const handleBook = () => {
    // Cal.com / Calendly style deep link — replace with your real booking URL.
    const url = profile.bookingUrl ?? "https://cal.com/sifat/15min";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");

    const data = new FormData(e.currentTarget);
    const entry = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    const payload = {
      from_name: entry.name,
      reply_to: entry.email,
      message: entry.message,
      to_name: profile.name,
    };

    try {
      if (apiConfigured) {
        await contactApi.create(entry);
      } else {
        const { serviceId, templateId, publicKey } = emailjsConfig ?? {};
        if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, payload, { publicKey });
        } else {
          await new Promise((r) => setTimeout(r, 700));
        }
        addMessage(entry);
      }

      setState("sent");
      formRef.current?.reset();
    } catch {
      setState("error");
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] opacity-60 blur-[110px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, color-mix(in oklab, var(--color-accent) 16%, transparent), transparent 68%)",
        }}
      />

      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* Left — headline + channels */}
          <div className="flex flex-col justify-between">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="inline-flex items-center gap-2.5 text-[13px] font-medium tracking-[0.18em] text-accent uppercase"
              >
                <span className="h-[5px] w-[5px] rounded-full bg-accent" />
                Contact
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.06 }}
                className="mt-6 text-[clamp(2.4rem,5.4vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-gradient"
              >
                Let&rsquo;s build something exceptional.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.14 }}
                className="mt-6 max-w-md text-[17px] leading-relaxed text-muted"
              >
                Internships, junior roles or a product that needs a full stack developer — send a note
                and I&rsquo;ll reply within a day.
              </motion.p>
            </div>

            <ul className="mt-12 space-y-2">
              {socials.map(({ href, Icon, label, handle }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.08 * i }}
                >
                  <Magnetic strength={0.16}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex w-full items-center gap-4 rounded-2xl border border-transparent px-3 py-3 transition-colors duration-300 hover:border-line hover:bg-surface/50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2/80 text-accent ring-1 ring-line transition-transform duration-500 group-hover:scale-105">
                        <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14.5px] font-medium text-ink">{label}</span>
                        <span className="block text-[12.5px] text-muted">{handle}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                    </a>
                  </Magnetic>
                </motion.li>
              ))}
             </ul>

             {/* Premium quick actions */}
             <div className="mt-8 flex flex-wrap gap-2">
               <button
                 type="button"
                 onClick={handleVCard}
                 className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-line bg-surface/60 px-4 text-[13.5px] font-medium text-ink backdrop-blur-md transition-all duration-300 hover:border-line-strong hover:bg-surface/90"
               >
                 <UserPlus
                   className="h-4 w-4 text-accent transition-transform duration-300 group-hover:-translate-y-0.5"
                   strokeWidth={1.9}
                 />
                 Save vCard
               </button>

               <button
                 type="button"
                 onClick={handleBook}
                 className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-line bg-surface/60 px-4 text-[13.5px] font-medium text-ink backdrop-blur-md transition-all duration-300 hover:border-line-strong hover:bg-surface/90"
               >
                 <CalendarPlus
                   className="h-4 w-4 text-accent transition-transform duration-300 group-hover:-translate-y-0.5"
                   strokeWidth={1.9}
                 />
                 Book a call
               </button>

               <button
                 type="button"
                 onClick={handleCopyEmail}
                 aria-label="Copy email address"
                 className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-line bg-surface/60 px-4 text-[13.5px] font-medium text-ink backdrop-blur-md transition-all duration-300 hover:border-line-strong hover:bg-surface/90"
               >
                 {copied ? (
                   <Check className="h-4 w-4 text-accent" strokeWidth={2.2} />
                 ) : (
                   <Copy className="h-4 w-4 text-accent transition-transform duration-300 group-hover:scale-105" strokeWidth={1.9} />
                 )}
                 {copied ? "Copied" : "Copy email"}
               </button>
             </div>
           </div>

           {/* Right — glass form */}
          <motion.div
            initial={{ opacity: 0, y: 32, filter: "blur(14px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative"
          >
            <div className="liquid liquid-edge liquid-sheen relative overflow-hidden rounded-[28px] p-7 elevate-3 sm:p-8">
              <span className="sweep" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
              />

              <AnimatePresence mode="wait">
                {state === "sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 text-accent ring-1 ring-accent/30"
                    >
                      <Check className="h-6 w-6" strokeWidth={2.2} />
                    </motion.span>
                    <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-ink">
                      Message received.
                    </h3>
                    <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
                      Thanks for reaching out — I&rsquo;ll get back to you within a day.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleVCard}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-line-strong"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-accent" strokeWidth={1.9} />
                        Save vCard
                      </button>
                      <button
                        type="button"
                        onClick={() => setState("idle")}
                        className="inline-flex h-10 items-center rounded-full border border-line px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-line-strong"
                      >
                        Send another
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={onSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Send a message</h3>
                      <span className="text-[12px] text-muted">Usually replies in &lt; 24h</span>
                    </div>

                    <Field label="Name" name="name" autoComplete="name" />
                    <Field label="Email" name="email" type="email" autoComplete="email" />
                    <Field label="Message" name="message" textarea />

                    <motion.button
                      type="submit"
                      disabled={state === "sending"}
                      whileTap={{ scale: 0.975 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      className="group relative mt-2 flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-accent text-[15px] font-medium text-white elevate-2 transition-shadow duration-300 hover:elevate-3 disabled:opacity-70"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[900ms] group-hover:translate-x-full"
                      />
                      {state === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.1} />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
                          Send message
                        </>
                      )}
                    </motion.button>

                    {state === "error" ? (
                      <p className="text-center text-[13px] text-red-500">
                        Something went wrong. Email me directly at {profile.email}.
                      </p>
                    ) : null}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 z-[160] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/12 px-4 py-3 text-[13.5px] font-medium text-ink backdrop-blur-xl elevate-3"
          >
            <Check className="h-4 w-4 text-accent" strokeWidth={2.4} />
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

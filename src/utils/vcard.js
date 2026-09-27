/**
 * vCard 3.0 builder. Escaping follows RFC 2426 §4: commas, semicolons and
 * backslashes are escaped, and newlines are folded.
 */
export function buildVCard(p) {
  const esc = (s = "") =>
    String(s)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(p.lastName ?? "")};${esc(p.name ?? "")};;;`,
    `FN:${esc(p.name)}`,
    `TITLE:${esc(p.role)}`,
    `ORG:${esc(p.company ?? "")}`,
    `EMAIL;type=INTERNET;type=pref:${esc(p.email)}`,
  ];

  if (p.github) lines.push(`URL;type=Github:${esc(p.github)}`);
  if (p.linkedin) lines.push(`URL;type=LinkedIn:${esc(p.linkedin)}`);
  if (p.location) lines.push(`ADR;type=WORK:;;${esc(p.location)};;;;`);
  if (p.statement) lines.push(`NOTE:${esc(p.statement)}`);

  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export function downloadVCard(p, filename = "Sifat.vcf") {
  const blob = new Blob([buildVCard(p)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/**
 * Clipboard with a document.execCommand fallback for non-secure origins,
 * where navigator.clipboard is undefined.
 * @returns {Promise<boolean>} whether the copy succeeded
 */
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

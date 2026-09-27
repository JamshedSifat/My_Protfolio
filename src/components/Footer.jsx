import { ArrowUp, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./icons";
import { useContent } from "../context/ContentContext";
import { useSmoothScroll } from "../context/SmoothScrollContext";
import { Magnetic } from "./Button";

export default function Footer() {
  const { nav, profile } = useContent();
  const { scrollTo } = useSmoothScroll();

  const socials = [
    { href: profile.github, Icon: GithubIcon, label: "GitHub" },
    { href: profile.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
    { href: `mailto:${profile.email}`, Icon: Mail, label: "Email" },
  ];

  return (
    <footer className="relative border-t border-line py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="liquid liquid-edge flex h-9 w-9 items-center justify-center rounded-[11px]">
              <span className="text-[14px] font-semibold text-accent">S</span>
            </span>
            <div>
              <p className="text-[14px] font-medium text-ink">{profile.name}</p>
              <p className="text-[12px] text-muted">{profile.role}</p>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(`#${item.id}`)}
                className="text-[13px] text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {socials.map(({ href, Icon, label }) => (
              <Magnetic key={label} strength={0.22}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
                </a>
              </Magnetic>
            ))}
            <Magnetic strength={0.22}>
              <button
                type="button"
                onClick={() => scrollTo(document.body, { duration: 1.6 })}
                className="flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                Back to top
                <ArrowUp className="h-[14px] w-[14px]" strokeWidth={1.9} />
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-6 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}. Crafted with obsessive attention to detail.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {profile.availability}
          </p>
        </div>
      </div>
    </footer>
  );
}

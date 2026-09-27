import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Radio } from "lucide-react";
import { GithubIcon } from "../components/icons";
import { useContent } from "../context/ContentContext";
import { SectionHeading, Reveal } from "../components/Reveal";
import { Button } from "../components/Button";
import ContributionHeatmap from "../components/github/ContributionHeatmap";
import CommitFeed from "../components/github/CommitFeed";
import RepoCard from "../components/github/RepoCard";
import { aggregateLanguages, fetchGitHubDashboard, recentActivity } from "../utils/github";
import LanguageUsage from "../components/github/LanguageUsage";
import RepoActivity from "../components/github/RepoActivity";

const SOURCE_LABEL = {
  graphql: "Live · GitHub GraphQL API",
  rest: "Live · GitHub REST API",
  local: "Cached snapshot",
};

export default function GitHubShowcase() {
  const { profile, settings } = useContent();
  const showHeatmap = settings?.showHeatmap !== false;
  const [data, setData] = useState(null);
  const enabled = settings?.showGitHub !== false;

  useEffect(() => {
    let cancelled = false;
    fetchGitHubDashboard(profile.githubUser).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const repos = data?.repos?.length ? data.repos : [];
  const languages = useMemo(() => aggregateLanguages(repos), [repos]);
  const activity = useMemo(() => recentActivity(repos), [repos]);

  if (!enabled) return null;

  return (
    <section id="github" className="relative scroll-mt-24 py-28 sm:py-32">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="GitHub"
            title="The work, as it happens."
            description="Contribution activity, pinned repositories and the latest commits — pulled directly from GitHub."
            className="max-w-2xl"
          />
          <Reveal delay={0.1}>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span className="liquid liquid-edge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-medium tracking-[0.06em] text-muted">
                <Radio className="h-3 w-3 text-accent" strokeWidth={2} />
                {SOURCE_LABEL[data?.source ?? "local"]}
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon={GithubIcon}
                href={profile.github}
                target="_blank"
                rel="noreferrer noopener"
                iconRight={ArrowUpRight}
              >
                @{profile.githubUser}
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 space-y-5">
          {showHeatmap ? <ContributionHeatmap calendar={data?.calendar} /> : null}

          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="liquid liquid-edge relative overflow-hidden rounded-[24px] p-6 elevate-2 sm:p-7">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">Repositories</h3>
                  <p className="mt-1 text-[13px] text-muted">Recently pushed, most maintained first</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(repos.length ? repos.slice(0, 4) : []).map((repo, i) => (
                  <RepoCard key={repo.name} repo={repo} index={i} />
                ))}
              </div>
            </div>

            <CommitFeed commits={data?.commits ?? []} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <LanguageUsage languages={languages} />
            <RepoActivity repos={activity} />
          </div>

          {repos.length > 4 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {repos.slice(4, 6).map((repo, i) => (
                <RepoCard key={repo.name} repo={repo} index={i + 1} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

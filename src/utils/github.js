import { baseContent } from "../data/site";

const { fallbackCommits, fallbackRepos, profile } = baseContent;

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const REST_ENDPOINT = "https://api.github.com";

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN ?? "";

const REPO_FIELDS = `
  name
  description
  url
  stargazerCount
  forkCount
  updatedAt
  isPrivate
  primaryLanguage { name color }
  languages(first: 6, orderBy: {field: SIZE, direction: DESC}) { nodes { name color } }
`;

const QUERY = `
query Dashboard($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { ${REPO_FIELDS} } }
    }
    repositories(first: 6, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
      nodes { ... on Repository { ${REPO_FIELDS} } }
    }
    repositories(first: 4, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
      nodes {
        name
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 2) {
                edges {
                  node {
                    abbreviatedOid
                    messageHeadline
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

/** Minimal colour map so REST (which omits language colours) still renders. */
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
};

/** Weighted language usage across the returned repositories. */
export function aggregateLanguages(repos = []) {
  const totals = new Map();

  repos.forEach((repo) => {
    (repo.languages?.length ? repo.languages : [repo.primaryLanguage].filter(Boolean)).forEach(
      (lang, index) => {
        if (!lang?.name) return;
        // Earlier entries are larger by GitHub's SIZE ordering.
        const weight = 1 / (index + 1);
        const current = totals.get(lang.name) ?? { name: lang.name, color: lang.color, weight: 0 };
        totals.set(lang.name, { ...current, color: lang.color ?? current.color, weight: current.weight + weight });
      },
    );
  });

  const sum = [...totals.values()].reduce((acc, l) => acc + l.weight, 0) || 1;
  return [...totals.values()]
    .map((l) => ({ name: l.name, color: l.color, percent: (l.weight / sum) * 100 }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6);
}

/** Repositories updated in the last 30 days, newest first. */
export function recentActivity(repos = [], days = 30) {
  const cutoff = Date.now() - days * 86400000;
  return repos
    .filter((r) => new Date(r.updatedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/** GraphQL returns {contributionDays:[...]}; the heatmap expects 7-day arrays. */
const normalizeCalendar = (calendar) => ({
  totalContributions: calendar?.totalContributions ?? 0,
  weeks: (calendar?.weeks ?? []).map((week) =>
    Array.isArray(week)
      ? week
      : (week?.contributionDays ?? []).map((day) => ({
          date: day.date,
          contributionCount: day.contributionCount ?? 0,
        })),
  ),
});

const flattenRepos = (nodes = []) =>
  nodes
    .filter(Boolean)
    .map((r) => ({
      name: r.name,
      description: r.description ?? "",
      url: r.url,
      stargazerCount: r.stargazerCount ?? 0,
      forkCount: r.forkCount ?? 0,
      updatedAt: r.updatedAt,
      isPrivate: Boolean(r.isPrivate),
      primaryLanguage: r.primaryLanguage ?? { name: "Code", color: "#94a3b8" },
      languages: (r.languages?.nodes ?? []).map((l) => ({
        name: l.name,
        color: l.color ?? LANG_COLORS[l.name] ?? "#94a3b8",
      })),
    }));

const flattenCommits = (nodes = []) =>
  nodes
    .flatMap((repo) =>
      (repo?.defaultBranchRef?.target?.history?.edges ?? []).map((edge) => ({
        sha: edge.node.abbreviatedOid,
        message: edge.node.messageHeadline,
        repo: repo.name,
        when: edge.node.committedDate,
      })),
    )
    .slice(0, 5);

/** Deterministic, good looking calendar used when the API is unavailable. */
export function syntheticCalendar() {
  const weeks = [];
  const today = new Date();
  const total = 53 * 7;
  for (let i = total - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const noise = seed - Math.floor(seed);
    const weekday = d.getDay();
    const weekendDamp = weekday === 0 || weekday === 6 ? 0.35 : 1;
    const wave = (Math.sin(i / 9) + 1) / 2;
    const count = Math.round(noise * 13 * weekendDamp * (0.35 + wave * 0.9));
    weeks.push({
      date: d.toISOString().slice(0, 10),
      contributionCount: Math.max(0, count),
    });
  }
  const days = weeks.flat?.() ?? weeks;
  return { weeks: chunkWeeks(days), totalContributions: days.reduce((a, b) => a + b.contributionCount, 0) };
}

function chunkWeeks(days) {
  const out = [];
  for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
  return out;
}

const relative = (iso) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

export const formatWhen = relative;

/** Accepts ISO strings or pre-formatted labels. */
export const formatWhenSafe = (value) => {
  if (!value) return "recently";
  return /^\d{4}-\d{2}-\d{2}|^\d{10}$/.test(value) ? relative(value) : value;
};

/**
 * GitHub GraphQL first, REST second, curated data last.
 * Never throws — the section must always render.
 */
export async function fetchGitHubDashboard(login = profile.githubUser) {
  if (TOKEN) {
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ query: QUERY, variables: { login } }),
      });
      if (res.ok) {
        const json = await res.json();
        const user = json?.data?.user;
        if (user) {
          return {
            source: "graphql",
            calendar: user.contributionsCollection?.contributionCalendar ?? syntheticCalendar(),
            pinned: flattenRepos(user.pinnedItems?.nodes),
            repos: flattenRepos(user.repositories?.nodes).slice(0, 6),
            commits: flattenCommits(user.repositories?.nodes ?? []),
          };
        }
      }
    } catch {
      /* fall through to REST */
    }
  }

  try {
    const [reposRes, eventsRes] = await Promise.all([
      fetch(`${REST_ENDPOINT}/users/${login}/repos?sort=pushed&per_page=6`),
      fetch(`${REST_ENDPOINT}/users/${login}/events/public?per_page=30`),
    ]);
    if (reposRes.ok) {
      const raw = await reposRes.json();
      const repos = raw.map((r) => ({
        name: r.name,
        description: r.description ?? "",
        url: r.html_url,
        stargazerCount: r.stargazers_count ?? 0,
        forkCount: r.forks_count ?? 0,
        updatedAt: r.pushed_at ?? r.updated_at,
        isPrivate: false,
        primaryLanguage: r.language ? { name: r.language, color: "#0a84ff" } : { name: "Code", color: "#94a3b8" },
        languages: r.language ? [{ name: r.language, color: LANG_COLORS[r.language] ?? "#0a84ff" }] : [],
      }));

      let commits = [];
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        commits = (Array.isArray(events) ? events : [])
          .filter((e) => e.type === "PushEvent")
          .flatMap((e) =>
            (e.payload?.commits ?? []).slice(0, 1).map((c) => ({
              sha: c.sha?.slice(0, 7) ?? "",
              message: c.message?.split("\n")[0] ?? "",
              repo: e.repo?.name?.split("/")[1] ?? "",
              when: e.created_at,
            })),
          )
          .slice(0, 5);
      }

      return {
        source: "rest",
        calendar: normalizeCalendar(syntheticCalendar()),
        pinned: repos.slice(0, 6),
        repos,
        commits: commits.length ? commits : fallbackCommits.map((c) => ({ ...c, when: relative(c.when) })),
      };
    }
  } catch {
    /* offline or rate limited — use curated data */
  }

  return {
    source: "local",
    calendar: normalizeCalendar(syntheticCalendar()),
    pinned: fallbackRepos.slice(0, 6),
    repos: fallbackRepos.map((repo) => ({
      ...repo,
      url: `${profile.github}/${repo.name}`,
    })),
    commits: fallbackCommits,
  };
}

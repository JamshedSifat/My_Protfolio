import type { Pool, PoolClient } from "pg";
import { db, transaction } from "./db.js";
import { contentSchema, projectSchema } from "./validation.js";

type Queryable = Pool | PoolClient;

function mapProject(row: Record<string, unknown>) {
  return {
    id: row.slug,
    index: row.display_index,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    image: row.image_url,
    image_url: row.image_url,
    demo: row.demo_url,
    repo: row.repository_url,
    tech: row.technologies,
    highlights: row.highlights,
    problem: row.problem,
    solution: row.solution,
    architecture: row.architecture,
    features: row.features,
    challenges: row.challenges,
    results: row.results,
    gallery: row.gallery,
    order: row.sort_order,
    is_featured: row.is_featured,
    is_published: row.is_published,
    updated_at: row.updated_at,
  };
}

export async function getPublicContent(queryable: Queryable = db) {
  const [heroResult, aboutResult, skillsResult, experienceResult, projectsResult, settingsResult, socialResult] = await Promise.all([
    queryable.query("SELECT * FROM hero WHERE id = 1"),
    queryable.query("SELECT * FROM about WHERE id = 1"),
    queryable.query("SELECT * FROM skills WHERE is_visible = true ORDER BY group_order, sort_order, id"),
    queryable.query("SELECT * FROM experiences WHERE is_visible = true ORDER BY sort_order, created_at DESC"),
    queryable.query("SELECT * FROM projects WHERE is_published = true AND is_featured = true ORDER BY sort_order, created_at DESC"),
    queryable.query("SELECT * FROM site_settings WHERE id = 1"),
    queryable.query("SELECT * FROM social_links WHERE is_visible = true ORDER BY sort_order, id"),
  ]);

  const hero = heroResult.rows[0] ?? {};
  const about = aboutResult.rows[0] ?? {};
  const settings = settingsResult.rows[0] ?? {};
  const socials = Object.fromEntries(socialResult.rows.map((row) => [String(row.platform).toLowerCase(), row.url]));

  const grouped = new Map<string, Array<{ name: string; note: string }>>();
  for (const skill of skillsResult.rows) {
    const items = grouped.get(skill.group_name) ?? [];
    items.push({ name: skill.name, note: skill.note });
    grouped.set(skill.group_name, items);
  }

  return {
    profile: {
      name: hero.name ?? "Sifat",
      role: hero.role ?? "Full Stack Developer",
      statement: hero.statement ?? "",
      availability: hero.availability ?? "",
      location: hero.location ?? "",
      email: hero.email ?? "",
      github: socials.github ?? hero.github_url ?? "",
      githubUser: hero.github_username ?? "",
      linkedin: socials.linkedin ?? hero.linkedin_url ?? "",
      bookingUrl: hero.booking_url ?? "",
      resumeFile: "Sifat-Full-Stack-Developer-Resume.pdf",
      portrait: about.portrait_url ?? "",
      aboutIntro: about.intro ?? "",
      aboutBody: about.body ?? "",
      focusAreas: about.focus_areas ?? [],
    },
    stats: hero.stats ?? [],
    capabilities: about.capability_cards ?? [],
    stack: [...grouped.entries()].map(([group, items]) => ({ group, items })),
    experience: experienceResult.rows.map((row) => ({
      id: row.id, role: row.role, company: row.company, period: row.period,
      summary: row.summary, points: row.points,
    })),
    projects: projectsResult.rows.map(mapProject),
    socialLinks: socialResult.rows.map((row) => ({ id: row.id, platform: row.platform, label: row.label, url: row.url })),
    seo: {
      title: settings.seo_title ?? "Sifat — Full Stack Developer",
      description: settings.seo_description ?? "",
      canonical: settings.canonical_url ?? "",
      ogImage: settings.og_image_url || "/og-image.png",
      indexable: settings.indexable ?? true,
    },
    settings: {
      defaultTheme: settings.default_theme ?? "system",
      accent: settings.accent ?? "#0A84FF",
      showGitHub: settings.show_github ?? true,
      showHeatmap: settings.show_heatmap ?? true,
      maintenanceMode: settings.maintenance_mode ?? false,
    },
    emailjs: { serviceId: "", templateId: "", publicKey: "" },
  };
}

export async function saveContent(input: unknown) {
  const payload = contentSchema.parse(input);
  return transaction(async (client) => {
    const p = payload.profile;
    await client.query(
      `UPDATE hero SET name=$1, role=$2, statement=$3, availability=$4, location=$5,
        email=$6, github_url=$7, github_username=$8, linkedin_url=$9, booking_url=$10,
        stats=$11, updated_at=now() WHERE id=1`,
      [p.name, p.role, p.statement, p.availability, p.location, p.email, p.github, p.githubUser, p.linkedin, p.bookingUrl, JSON.stringify(payload.stats)],
    );
    await client.query(
      `UPDATE about SET intro=$1, body=$2, portrait_url=COALESCE(NULLIF($3,''), portrait_url),
        focus_areas=$4, capability_cards=$5, updated_at=now() WHERE id=1`,
      [p.aboutIntro, p.aboutBody, p.portrait, JSON.stringify(p.focusAreas), JSON.stringify(payload.capabilities)],
    );

    await client.query("DELETE FROM skills");
    for (const [groupOrder, group] of payload.stack.entries()) {
      for (const [sortOrder, item] of group.items.entries()) {
        await client.query(
          "INSERT INTO skills (group_name,name,note,group_order,sort_order) VALUES ($1,$2,$3,$4,$5)",
          [group.group, item.name, item.note, groupOrder, sortOrder],
        );
      }
    }

    await client.query("DELETE FROM experiences");
    for (const [sortOrder, item] of payload.experience.entries()) {
      await client.query(
        "INSERT INTO experiences (role,company,period,summary,points,sort_order) VALUES ($1,$2,$3,$4,$5,$6)",
        [item.role, item.company, item.period, item.summary, JSON.stringify(item.points), sortOrder],
      );
    }

    const slugs: string[] = [];
    for (const [sortOrder, raw] of payload.projects.entries()) {
      const project = projectSchema.parse({ ...raw, order: sortOrder });
      slugs.push(project.id);
      await upsertProject(client, project);
    }
    if (slugs.length) await client.query("DELETE FROM projects WHERE NOT (slug = ANY($1::text[]))", [slugs]);
    else await client.query("DELETE FROM projects");

    await client.query(
      `UPDATE site_settings SET seo_title=$1, seo_description=$2, canonical_url=$3,
       og_image_url=$4, indexable=$5, default_theme=$6, accent=$7, show_github=$8,
       show_heatmap=$9, maintenance_mode=$10, updated_at=now() WHERE id=1`,
      [payload.seo.title, payload.seo.description, payload.seo.canonical, payload.seo.ogImage,
        payload.seo.indexable, payload.settings.defaultTheme, payload.settings.accent,
        payload.settings.showGitHub, payload.settings.showHeatmap, payload.settings.maintenanceMode],
    );
    await client.query(
      `INSERT INTO social_links(platform,label,url,sort_order) VALUES ('GitHub','GitHub',$1,0)
       ON CONFLICT(platform) DO UPDATE SET url=excluded.url, updated_at=now()`, [p.github],
    );
    await client.query(
      `INSERT INTO social_links(platform,label,url,sort_order) VALUES ('LinkedIn','LinkedIn',$1,1)
       ON CONFLICT(platform) DO UPDATE SET url=excluded.url, updated_at=now()`, [p.linkedin],
    );

    return getPublicContent(client);
  });
}

export async function upsertProject(client: Queryable, project: ReturnType<typeof projectSchema.parse>) {
  const result = await client.query(
    `INSERT INTO projects
      (slug,display_index,title,tagline,description,image_url,demo_url,repository_url,technologies,
       highlights,problem,solution,architecture,features,challenges,results,gallery,sort_order,is_featured,is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     ON CONFLICT(slug) DO UPDATE SET display_index=excluded.display_index,title=excluded.title,
       tagline=excluded.tagline,description=excluded.description,
       image_url=COALESCE(NULLIF(excluded.image_url,''),projects.image_url),demo_url=excluded.demo_url,
       repository_url=excluded.repository_url,technologies=excluded.technologies,highlights=excluded.highlights,
       problem=excluded.problem,solution=excluded.solution,architecture=excluded.architecture,
       features=excluded.features,challenges=excluded.challenges,results=excluded.results,gallery=excluded.gallery,
       sort_order=excluded.sort_order,is_featured=excluded.is_featured,is_published=excluded.is_published,updated_at=now()
     RETURNING *`,
    [project.id, project.index, project.title, project.tagline, project.description,
      project.image_url || project.image, project.demo, project.repo, JSON.stringify(project.tech),
      JSON.stringify(project.highlights), project.problem, project.solution, project.architecture,
      JSON.stringify(project.features), JSON.stringify(project.challenges), JSON.stringify(project.results),
      JSON.stringify(project.gallery), project.order, project.is_featured, project.is_published],
  );
  return mapProject(result.rows[0]);
}

export { mapProject };
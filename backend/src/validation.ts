import { z } from "zod";

const urlOrEmpty = z.union([z.literal(""), z.string().url()]);
const stringArray = z.array(z.string().trim().max(300)).max(60);

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(300) });
export const refreshSchema = z.object({ refresh: z.string().min(20) });
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export const projectSchema = z.object({
  id: z.string().trim().min(1).max(180),
  index: z.string().max(8).optional().default(""),
  title: z.string().trim().min(2).max(220),
  tagline: z.string().max(260).optional().default(""),
  description: z.string().trim().min(10),
  image: z.string().optional().default(""),
  image_url: z.string().optional().default(""),
  demo: urlOrEmpty.optional().default(""),
  repo: urlOrEmpty.optional().default(""),
  tech: stringArray.optional().default([]),
  highlights: stringArray.optional().default([]),
  problem: z.string().optional().default(""),
  solution: z.string().optional().default(""),
  architecture: z.string().optional().default(""),
  features: stringArray.optional().default([]),
  challenges: stringArray.optional().default([]),
  results: stringArray.optional().default([]),
  gallery: z.array(z.string()).max(20).optional().default([]),
  order: z.number().int().min(0).optional().default(0),
  is_featured: z.boolean().optional().default(true),
  is_published: z.boolean().optional().default(true),
});

export const contentSchema = z.object({
  profile: z.object({
    name: z.string().max(120), role: z.string().max(160), statement: z.string(),
    availability: z.string().max(180), location: z.string().max(180), email: z.string().email(),
    github: urlOrEmpty, githubUser: z.string().max(100), linkedin: urlOrEmpty,
    bookingUrl: urlOrEmpty.optional().default(""), portrait: z.string().optional().default(""),
    aboutIntro: z.string().optional().default(""), aboutBody: z.string().optional().default(""),
    focusAreas: stringArray.optional().default([]), resumeFile: z.string().optional(),
  }).passthrough(),
  stats: z.array(z.object({ value: z.string().max(40), label: z.string().max(120) })).max(12),
  capabilities: z.array(z.object({ title: z.string().max(160), body: z.string(), meta: z.string().max(180) })).max(12),
  stack: z.array(z.object({ group: z.string().max(100), items: z.array(z.object({ name: z.string().max(120), note: z.string().max(180) })).max(50) })).max(20),
  experience: z.array(z.object({ id: z.any().optional(), role: z.string().max(180), company: z.string().max(180), period: z.string().max(100), summary: z.string(), points: stringArray.optional().default([]) })).max(50),
  projects: z.array(projectSchema).max(100),
  seo: z.object({ title: z.string().max(180), description: z.string().max(320), canonical: urlOrEmpty, ogImage: z.string(), indexable: z.boolean() }),
  settings: z.object({ defaultTheme: z.enum(["system", "dark", "light"]), accent: z.string().regex(/^#[0-9a-f]{6}$/i), showGitHub: z.boolean(), showHeatmap: z.boolean(), maintenanceMode: z.boolean() }),
}).passthrough();
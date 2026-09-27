CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL DEFAULT 'Portfolio Admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  jti uuid PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS refresh_tokens_admin_idx ON refresh_tokens(admin_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_expires_idx ON refresh_tokens(expires_at);

CREATE TABLE IF NOT EXISTS hero (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name varchar(120) NOT NULL DEFAULT 'Sifat',
  role varchar(160) NOT NULL DEFAULT 'Full Stack Developer',
  statement text NOT NULL DEFAULT '',
  availability varchar(180) NOT NULL DEFAULT '',
  location varchar(180) NOT NULL DEFAULT '',
  email varchar(254) NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  github_username varchar(100) NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  booking_url text NOT NULL DEFAULT '',
  stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS about (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  intro text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  portrait_url text NOT NULL DEFAULT '',
  portrait_public_id text NOT NULL DEFAULT '',
  focus_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  capability_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name varchar(100) NOT NULL,
  name varchar(120) NOT NULL,
  note varchar(180) NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  group_order integer NOT NULL DEFAULT 0 CHECK (group_order >= 0),
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_name, name)
);
CREATE INDEX IF NOT EXISTS skills_order_idx ON skills(group_order, sort_order);

CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role varchar(180) NOT NULL,
  company varchar(180) NOT NULL,
  period varchar(100) NOT NULL,
  summary text NOT NULL DEFAULT '',
  points jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(180) NOT NULL UNIQUE,
  display_index varchar(8) NOT NULL DEFAULT '',
  title varchar(220) NOT NULL,
  tagline varchar(260) NOT NULL DEFAULT '',
  description text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  image_public_id text NOT NULL DEFAULT '',
  demo_url text NOT NULL DEFAULT '',
  repository_url text NOT NULL DEFAULT '',
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  problem text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  architecture text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_featured boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_public_idx ON projects(is_published, is_featured, sort_order);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(160) NOT NULL,
  email varchar(254) NOT NULL,
  message varchar(5000) NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  ip_address inet,
  user_agent varchar(500) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_unread_idx ON contact_messages(is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  seo_title varchar(180) NOT NULL DEFAULT '',
  seo_description varchar(320) NOT NULL DEFAULT '',
  canonical_url text NOT NULL DEFAULT '',
  og_image_url text NOT NULL DEFAULT '',
  og_image_public_id text NOT NULL DEFAULT '',
  indexable boolean NOT NULL DEFAULT true,
  default_theme varchar(10) NOT NULL DEFAULT 'system' CHECK (default_theme IN ('system', 'dark', 'light')),
  accent varchar(7) NOT NULL DEFAULT '#0A84FF' CHECK (accent ~ '^#[0-9A-Fa-f]{6}$'),
  show_github boolean NOT NULL DEFAULT true,
  show_heatmap boolean NOT NULL DEFAULT true,
  maintenance_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  public_id text NOT NULL UNIQUE,
  original_name varchar(255) NOT NULL,
  bytes bigint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_resume ON resumes(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform varchar(80) NOT NULL UNIQUE,
  label varchar(100) NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  public_id text NOT NULL UNIQUE,
  original_name varchar(255) NOT NULL,
  resource_type varchar(20) NOT NULL DEFAULT 'image',
  bytes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_events (
  id bigserial PRIMARY KEY,
  kind varchar(32) NOT NULL CHECK (kind IN ('view', 'resume_download', 'contact')),
  session_key varchar(80) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS site_events_kind_date_idx ON site_events(kind, created_at DESC);

INSERT INTO hero (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO about (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
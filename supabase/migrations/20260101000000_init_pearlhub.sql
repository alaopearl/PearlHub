-- PearlHub content schema, public RLS policies, and author + tool seed data.
create extension if not exists pgcrypto;

create table if not exists public.authors (
  id text primary key,
  name text not null,
  title text,
  avatar text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content jsonb not null default '[]'::jsonb,
  category text not null check (category in ('technology', 'education')),
  subcategory text,
  author_id text references public.authors (id) on delete set null,
  published_at date not null default current_date,
  read_time integer not null default 5,
  tags text[] not null default '{}',
  featured boolean not null default false,
  gradient text,
  created_at timestamptz not null default now()
);

create table if not exists public.tools (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  category text,
  icon text,
  formula text,
  how_to_use text[] not null default '{}',
  inputs jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  related_article_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  category text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  item_id text not null,
  title text,
  type text,
  client_session_id text,
  created_at timestamptz not null default now()
);

create index if not exists articles_category_idx on public.articles (category, subcategory);
create index if not exists articles_featured_idx on public.articles (featured) where featured;
create index if not exists tools_category_idx on public.tools (category);

alter table public.authors enable row level security;
alter table public.articles enable row level security;
alter table public.tools enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.bookmarks enable row level security;

drop policy if exists "Public read authors" on public.authors;
create policy "Public read authors" on public.authors for select to anon, authenticated using (true);

drop policy if exists "Public read articles" on public.articles;
create policy "Public read articles" on public.articles for select to anon, authenticated using (true);

drop policy if exists "Public read tools" on public.tools;
create policy "Public read tools" on public.tools for select to anon, authenticated using (true);

drop policy if exists "Public insert contact messages" on public.contact_messages;
create policy "Public insert contact messages" on public.contact_messages for insert to anon, authenticated with check (true);

drop policy if exists "Public insert newsletter" on public.newsletter_subscribers;
create policy "Public insert newsletter" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

drop policy if exists "Public read bookmarks" on public.bookmarks;
create policy "Public read bookmarks" on public.bookmarks for select to anon, authenticated using (true);

drop policy if exists "Public insert bookmarks" on public.bookmarks;
create policy "Public insert bookmarks" on public.bookmarks for insert to anon, authenticated with check (true);

drop policy if exists "Public delete bookmarks" on public.bookmarks;
create policy "Public delete bookmarks" on public.bookmarks for delete to anon, authenticated using (true);

insert into public.authors (id, name, title, avatar, bio) values
  ('a1', 'Chidi Okonkwo', 'Senior Tech Editor', 'CO', 'Chidi covers AI, programming, and software development with 8 years of experience building products across Africa and Europe.'),
  ('a2', 'Amara Bello', 'Education Lead', 'AB', 'Amara specializes in Nigerian exam preparation, university admissions, and scholarship guidance for students across West Africa.'),
  ('a3', 'David Mensah', 'Software Engineer', 'DM', 'David writes practical tutorials on React, Python, and modern web development stacks used by African startups.'),
  ('a4', 'Fatima Yusuf', 'Academic Advisor', 'FY', 'Fatima helps students navigate GPA calculations, CGPA grading scales, and scholarship applications for local and international universities.'),
  ('a5', 'Emeka Nwosu', 'Gadget Reviewer', 'EN', 'Emeka reviews phones, laptops, and accessories available in the Nigerian market with honest, data-driven assessments.'),
  ('a6', 'Sarah Adeyemi', 'Content Strategist', 'SA', 'Sarah curates study resources, productivity guides, and career content for PearlHub education vertical.')
on conflict (id) do nothing;

insert into public.tools (id, name, slug, description, category, icon, formula, how_to_use, inputs, faq, related_article_ids) values
  ('tool1', 'Percentage Calculator', 'percentage-calculator', 'Calculate percentages, percentage change, and percentage of a number instantly.', 'Calculators', 'Percent', 'Percentage = (Part / Whole) x 100', array['Enter the part value and whole value', 'Select calculation type: find percentage, find part, or find whole', 'View instant results with step-by-step breakdown'], $j$[{"label":"Part Value","type":"number","placeholder":"e.g. 45"},{"label":"Whole Value","type":"number","placeholder":"e.g. 200"}]$j$::jsonb, $j$[{"question":"How do I calculate percentage increase?","answer":"Subtract old value from new value, divide by old value, multiply by 100."}]$j$::jsonb, array['e1']),
  ('tool2', 'GPA Calculator', 'gpa-calculator', 'Calculate your Grade Point Average on 4.0 or 5.0 scales with detailed breakdown.', 'Academic', 'GraduationCap', 'GPA = Sum of (Grade Points x Credit Units) / Total Credit Units', array['Select your grading scale (4.0 or 5.0)', 'Add each course with its grade and credit units', 'View your calculated GPA with quality points breakdown'], $j$[{"label":"Grading Scale","type":"select","placeholder":"Choose scale","options":["4.0 Scale","5.0 Scale (Nigerian)"]},{"label":"Course Grade","type":"select","placeholder":"Select grade","options":["A","B","C","D","E","F"]},{"label":"Credit Units","type":"number","placeholder":"e.g. 3"}]$j$::jsonb, $j$[{"question":"What is the difference between GPA and CGPA?","answer":"GPA is for a single semester. CGPA averages across all semesters completed so far."}]$j$::jsonb, array['e1']),
  ('tool3', 'CGPA Calculator', 'cgpa-calculator', 'Calculate your Cumulative GPA across multiple semesters on the Nigerian 5.0 scale.', 'Academic', 'Layers', 'CGPA = Total Quality Points / Total Units', array['Add each semester total quality points and total units', 'The tool calculates your cumulative GPA automatically', 'View your degree classification (First Class, 2:1, etc.)'], $j$[{"label":"Semester Quality Points","type":"number","placeholder":"e.g. 45"},{"label":"Semester Total Units","type":"number","placeholder":"e.g. 10"}]$j$::jsonb, $j$[{"question":"What CGPA do I need for First Class?","answer":"Most Nigerian universities require a CGPA of 4.50 or above on the 5.0 scale."}]$j$::jsonb, array['e1','e6']),
  ('tool4', 'Age Calculator', 'age-calculator', 'Calculate exact age in years, months, and days from any date of birth.', 'Calculators', 'Calendar', 'Age = Current Date - Birth Date', array['Enter your date of birth', 'Select the reference date (defaults to today)', 'View exact age in years, months, days, and total days'], $j$[{"label":"Date of Birth","type":"date","placeholder":"Select date"},{"label":"Reference Date","type":"date","placeholder":"Defaults to today"}]$j$::jsonb, $j$[{"question":"Does this account for leap years?","answer":"Yes, the calculator handles leap years and exact day counts."}]$j$::jsonb, array[]::text[]),
  ('tool5', 'Word Counter', 'word-counter', 'Count words, sentences, paragraphs, and reading time from any text instantly.', 'Text & Writing', 'Type', 'Words = Text split by whitespace. Reading time = Words / 200', array['Paste or type your text in the input area', 'View real-time word, sentence, and paragraph counts', 'See estimated reading time'], $j$[{"label":"Your Text","type":"textarea","placeholder":"Paste or type your text here..."}]$j$::jsonb, $j$[{"question":"How is reading time calculated?","answer":"We use 200 words per minute for a conservative estimate."}]$j$::jsonb, array['e7']),
  ('tool6', 'Character Counter', 'character-counter', 'Count characters with and without spaces, plus social media limit checks.', 'Text & Writing', 'Hash', 'Characters = Total length of string', array['Enter your text to count', 'View character count with and without spaces', 'Check against Twitter, Instagram, and SMS limits'], $j$[{"label":"Your Text","type":"textarea","placeholder":"Type text to count characters..."}]$j$::jsonb, $j$[{"question":"Why do character limits matter?","answer":"Twitter allows 280 characters, Instagram captions 2,200, and SMS segments 160."}]$j$::jsonb, array[]::text[]),
  ('tool7', 'Text Case Converter', 'text-case-converter', 'Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.', 'Text & Writing', 'Clipboard', 'Each case follows specific transformation rules on word boundaries', array['Paste your text into the converter', 'Select the desired output case format', 'Copy the converted text with one click'], $j$[{"label":"Input Text","type":"textarea","placeholder":"Enter text to convert..."},{"label":"Target Case","type":"select","placeholder":"Select case","options":["UPPERCASE","lowercase","Title Case","camelCase","snake_case","kebab-case"]}]$j$::jsonb, $j$[{"question":"camelCase vs PascalCase?","answer":"camelCase starts lowercase (myVariable), PascalCase starts uppercase (MyVariable)."}]$j$::jsonb, array['t5']),
  ('tool8', 'Average Calculator', 'average-calculator', 'Calculate mean, median, and mode from any set of numbers with full breakdown.', 'Calculators', 'Calculator', 'Mean = Sum of values / Count', array['Enter numbers separated by commas or spaces', 'View mean, median, and mode results', 'See the step-by-step calculation breakdown'], $j$[{"label":"Numbers","type":"text","placeholder":"e.g. 10, 20, 30, 40, 50"}]$j$::jsonb, $j$[{"question":"What if there is no mode?","answer":"If all values appear once, there is no mode. Two ties make the dataset bimodal."}]$j$::jsonb, array['e3']),
  ('tool9', 'Discount Calculator', 'discount-calculator', 'Calculate final price, savings amount, and effective discount from any sale.', 'Calculators', 'Tag', 'Final Price = Original - (Original x Discount% / 100)', array['Enter the original price and discount percentage', 'View the savings amount and final price', 'Compare across multiple items'], $j$[{"label":"Original Price","type":"number","placeholder":"e.g. 50000"},{"label":"Discount Percentage","type":"number","placeholder":"e.g. 25"}]$j$::jsonb, $j$[{"question":"How do stacked discounts work?","answer":"Apply sequentially. 20% then 10% gives an effective 28% off."}]$j$::jsonb, array[]::text[]),
  ('tool10', 'Loan Calculator', 'loan-calculator', 'Calculate monthly payments, total interest, and amortization for any loan.', 'Calculators', 'Scale', 'Monthly Payment = P x [r(1+r)^n] / [(1+r)^n - 1]', array['Enter loan principal, annual interest rate, and tenure', 'View monthly payment and total interest', 'See a year-by-year amortization breakdown'], $j$[{"label":"Loan Amount","type":"number","placeholder":"e.g. 500000"},{"label":"Annual Interest Rate (%)","type":"number","placeholder":"e.g. 15"},{"label":"Tenure (Months)","type":"number","placeholder":"e.g. 24"}]$j$::jsonb, $j$[{"question":"Typical Nigerian loan rate?","answer":"Commercial bank loans range from 15% to 30% annually."}]$j$::jsonb, array[]::text[]),
  ('tool11', 'Unit Converter', 'unit-converter', 'Convert between length, weight, temperature, and data storage units instantly.', 'Utilities', 'ArrowLeftRight', 'Each conversion uses a fixed multiplication factor', array['Select the unit category', 'Choose source and target units', 'Enter the value to see instant conversion'], $j$[{"label":"Category","type":"select","placeholder":"Select type","options":["Length","Weight","Temperature","Data Storage"]},{"label":"Value","type":"number","placeholder":"Enter value"},{"label":"From Unit","type":"text","placeholder":"e.g. kg"},{"label":"To Unit","type":"text","placeholder":"e.g. lbs"}]$j$::jsonb, $j$[{"question":"How many bytes in 1 GB?","answer":"1 GB = 1,073,741,824 bytes (binary) or 1,000,000,000 bytes (decimal)."}]$j$::jsonb, array[]::text[]),
  ('tool12', 'QR Code Generator', 'qr-code-generator', 'Generate QR codes from URLs, text, or contact information with download options.', 'Utilities', 'QrCode', 'QR encoding follows ISO/IEC 18004', array['Enter a URL or text content to encode', 'Select error correction level and size', 'Download the QR code as PNG or SVG'], $j$[{"label":"URL or Text","type":"text","placeholder":"https://pearlhub.com"},{"label":"Error Correction","type":"select","placeholder":"Select level","options":["Low (7%)","Medium (15%)","Quartile (25%)","High (30%)"]}]$j$::jsonb, $j$[{"question":"Do QR codes expire?","answer":"Static QR codes never expire. Dynamic links depend on the destination URL."}]$j$::jsonb, array[]::text[])
on conflict (id) do nothing;
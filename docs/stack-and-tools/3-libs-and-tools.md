## Libs and tools


### 1. Front-end scaffolding
| Need | Pick | Why it’s fast |
|------|------|--------------|
| **Component boilerplate** | `shadcn/ui` or `Headless UI` + Radix Icons | Copy-paste Tailwind-ready components, theme with Radix Colors in minutes. |
| **Routing & data** | TanStack Router + TanStack Query | File-based routing + built-in async caching; drops straight into Vite. |
| **Global state** | Zustand or Jotai | <1 kB, React-native friendly, no boilerplate. |
| **Forms / validation** | React-Hook-Form + Zod | Auto-types TS schemas; Supabase adapters available. |
| **Testing** | Vitest + Testing Library | Shares Vite config; near-zero setup. |

---

### 2. Auth & user accounts  
* **Supabase Auth** (email / magic-link / OAuth) — built-in, free up to **50 k MAUs**.  ([Pricing & Fees - Supabase](https://supabase.com/pricing?utm_source=chatgpt.com))  
* **Clerk** if you need multi-org/SAML later; first **10 k MAUs free** with React drop-ins.  ([Pricing - Clerk](https://clerk.com/pricing?utm_source=chatgpt.com))  

---

### 3. Data, realtime & storage  
| Layer | Default | Swappable later |
|-------|---------|-----------------|
| **SQL** | Supabase Postgres — 500 MB DB, 5 GB bandwidth, 1 GB object storage on the free tier.  ([Pricing & Fees - Supabase](https://supabase.com/pricing?utm_source=chatgpt.com)) | Cloudflare D1 (SQLite edge; free read/write quota)  ([Pricing - D1 - Cloudflare Docs](https://developers.cloudflare.com/d1/platform/pricing/?utm_source=chatgpt.com)) |
| **Edge cache / KV** | Supabase “Realtime” & in-browser `@supabase-cache-helpers` | Cloudflare KV (100 k reads/day free)  ([Cloudflare Workers 2025 Features, Pricing, Regions & Alternatives](https://www.srvrlss.io/provider/cloudflare/?utm_source=chatgpt.com)) |

---

### 4. Serverless & background work  
* **Supabase Edge Functions** (Deno) — deploy from CLI, same auth context.  
* **Cloudflare Workers** — 100 k req/day, 10 ms CPU per request free.  ([Cloudflare Workers 2025 Features, Pricing, Regions & Alternatives](https://www.srvrlss.io/provider/cloudflare/?utm_source=chatgpt.com))  
* **Inngest** — queue & cron jobs with durable retries, **free forever tier**.  ([Pricing - Inngest](https://www.inngest.com/pricing?utm_source=chatgpt.com))  

---

### 5. Hosting & CI/CD  
| Static/SSR host | Free quota |
|-----------------|-----------|
| **Cloudflare Pages** – unlimited sites, bandwidth, 500 builds/month.  ([Cloudflare Pages](https://pages.cloudflare.com/?utm_source=chatgpt.com)) |
| Vercel Hobby – great DX, personal & open-source only.  ([Vercel Hobby Plan](https://vercel.com/docs/plans/hobby?utm_source=chatgpt.com)) |

Both auto-deploy from GitHub; no YAML needed.

---

### 6. Comms & payments  
| Function | Service | Free tier |
|----------|---------|-----------|
| **Transactional e-mail** | **Resend** – 3 k emails/month.  ([Pricing - Resend](https://resend.com/pricing?utm_source=chatgpt.com)) |
| **Push / in-app messages** | OneSignal – 10 k subs, unlimited notifications. |
| **Payments** | Stripe – pay-as-you-go (no monthly fee). |

---

### 7. Analytics, feature flags, A/B  
| Need | Service | Notes |
|------|---------|-------|
| **Product analytics + session replays** | **PostHog Cloud** – free tier covers 15 k events/day; self-host any time.  ([PostHog pricing](https://posthog.com/pricing?utm_source=chatgpt.com)) |
| **Privacy-first web stats** | Plausible – open-source, 30-day free cloud trial, or docker-compose deploy.  ([Plausible Analytics | Simple, privacy-friendly Google Analytics ...](https://plausible.io/?utm_source=chatgpt.com)) |
| **Feature flags / experiments** | GrowthBook OSS – drop-in React provider. |

---

### 8. Ops & monitoring  
* **Sentry** — 5 k errors + 1 GB traces/month (free).  
* **Highlight.io** — full-stack session replay, 100 k events free.  
* **Uptime** — BetterStack Monitor (50 checks, 3-min interval free).

---

### 9. DX niceties  
| Purpose | Tool |
|---------|------|
| **Design tokens ↔ Figma** | Figma Tokens plugin – syncs Tailwind config. |
| **Mock data/APIs** | [Mock Service Worker](https://mswjs.io) – intercepts fetch during local dev. |
| **Visual CMS** | **Next.js Liveblocks + Supabase** or **Sanity.io** free “Hobby” plan. |
| **Content & copy** | Notion as headless CMS via public-API fetch. |

---

## Putting it together (1-hour starter recipe)
1. **`npm create vite@latest my-saas --template react-ts`**  
2. `npx supabase init` → link project & generate typed client.  
3. `npx shadcn-ui@latest init` → pick Tailwind config.  
4. Add TanStack Query + Zustand.  
5. `npx supabase login && supabase functions deploy signup-webhook` (example edge fn).  
6. Commit to GitHub → Cloudflare Pages “Connect project” → deploy.  
7. Enable Resend domain & PostHog script; publish.

You now have **auth, database, file storage, edge functions, hosting, email, analytics, and background jobs** – all on free plans – with exactly one dashboard that bills you (Supabase).

**Cost to run until you hit real traction: $0.**

When traction comes, you can:

* Scale Postgres inside Supabase or migrate to Cloudflare D1/Neon without code changes.
* Swap Supabase Auth for Clerk for enterprise SSO.
* Move background jobs from Inngest to dedicated queue (e.g., Cloudflare Queues) with minimal refactor.

---

### Why this works for ultra-fast validation
* **Zero infra ops** – every box is managed or serverless.  
* **Type safety end-to-end** – React TS ↔ Zod ↔ Supabase typed client.  
* **One-click deploy** – Cloudflare Pages & Supabase GitHub actions.  
* **Exit ramps** – all services are OSS-friendly or standard protocols (SQL, HTTP).  

Spin up, test demand, iterate, pivot, or kill fast – then only pay when you’ve found product-market fit.

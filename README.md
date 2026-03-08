This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker Configuration

Development config:

- Compose file: `docker-compose.dev.yml`
- Env template: `.env.development.docker.example`
- Local env file: `.env.development.docker`

Production config:

- Compose file: `docker-compose.prod.yml`
- Env template: `.env.production.docker.example`
- Local env file: `.env.production.docker`

Create env files:

```bash
cp .env.development.docker.example .env.development.docker
cp .env.production.docker.example .env.production.docker
```

Start development stack (app + postgres):

```bash
npm run docker:dev:up
```

Start production stack (app + postgres):

```bash
npm run docker:prod:up
```

## OSM Ingestion Pipeline

Pipeline script: `scripts/ingest-osm-centers.mjs`

Source: Overpass (OSM)

Filter conditions:

- Has `opening_hours`
- Has `website` or `contact:website`

Stored table: `public.osm_sport_centers`

Run ingestion on dev stack:

```bash
npm run docker:dev:ingest
```

Run ingestion on prod stack:

```bash
npm run docker:prod:ingest
```

Run ingestion locally:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/arenago npm run ingest:osm
```

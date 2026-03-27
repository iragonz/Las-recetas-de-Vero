# Las Recetas de Vero

A full-stack recipe management web app built with **Next.js 15**, **Notion API**, and **Tailwind CSS**. Designed as a personal cookbook for tracking tried recipes and planning new ones to cook.

## Features

- **Dual recipe management** — Two tabs: "Hechas" (done) and "Por hacer" (planned), each backed by a separate Notion database
- **Move to done** — One-click "Ya la hicimos!" button to promote a planned recipe to the done list
- **Smart filtering & sorting** — Search by name/ingredients, filter by category, type, rating, and favorites. Sort by name, prep time, or personal ratings
- **Grid & list views** — Toggle between card grid and compact list layouts
- **Photo management** — Upload images from device/mobile via ImgBB, or paste URLs. Set a main photo and build a gallery
- **Personal ratings** — Independent rating system for two users (Sobresaliente / Notable / Bien / Suspenso)
- **Favorites & random pick** — Mark favorites and get a random recipe suggestion from filtered results
- **AI-powered input** — Create recipes from photos or voice using Google Gemini
- **Responsive PWA** — Mobile-first design, installable as a progressive web app
- **In-memory caching** — 5-minute shared cache for fast page loads

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Frontend | React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | Notion API (REST, v2022-06-28) |
| Image hosting | ImgBB API |
| AI | Google Gemini (gemini-2.5-flash-lite) |
| Deployment | Vercel |
| Language | TypeScript |

## Architecture

```
src/app/
  _lib/           # Shared utilities
    notion.ts      # Notion API service (CRUD for both databases)
    cache.ts       # In-memory cache with 5min TTL
    types.ts       # TypeScript interfaces
  _components/     # Reusable UI components
  api/
    recipes/       # Done recipes CRUD endpoints
    planned/       # Planned recipes CRUD + move-to-done
    upload/        # Image upload proxy (ImgBB)
    gemini/        # AI recipe extraction
  receta/          # Done recipe pages (detail, edit, create)
  planificada/     # Planned recipe pages (detail, edit, create)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Notion integration](https://www.notion.so/my-integrations) with access to two databases
- An [ImgBB API key](https://api.imgbb.com/) (free)
- (Optional) A [Google AI Studio API key](https://aistudio.google.com/) for AI features

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/iragonz/Las-recetas-de-Vero.git
   cd Las-recetas-de-Vero
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your credentials:
   ```env
   NOTION_API_KEY=your_notion_integration_token
   NOTION_DATABASE_ID=your_done_recipes_database_id
   NOTION_PLANNED_DB_ID=your_planned_recipes_database_id
   IMGBB_API_KEY=your_imgbb_api_key
   GEMINI_API_KEY=your_google_ai_key  # optional
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Notion Database Structure

**Done Recipes** requires these properties:
| Property | Type |
|----------|------|
| Nombre de la Receta | Title |
| Ingredientes | Rich text |
| Instrucciones | Rich text |
| Observaciones | Rich text |
| Link | URL |
| Fotos | Files & media |
| Tipo | Multi-select |
| Categoría | Multi-select |
| Favorito | Checkbox |
| Nivel de gusto Iván | Select |
| Nivel de gusto Vero | Select |
| Tiempo de Preparación | Number |

**Planned Recipes** uses the same structure minus: Favorito, Nivel de gusto Iván/Vero, and Tiempo de Preparación.

## Deployment

Deploy to [Vercel](https://vercel.com) in one click — just import the GitHub repo and add the environment variables.

## License

MIT

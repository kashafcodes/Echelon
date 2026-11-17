# Echelon

LokArt – Empowering local Nepali artisans by connecting traditional craftsmanship with digital opportunities through an inclusive online marketplace.

**No Craft Forgotten. No Creator Unseen.**

**Where Heritage Meets Opportunity.**

## Run the project

You need Node.js. From this folder:

```bash
npm run setup
npm run dev
```

- Website: http://localhost:5173
- API health check: http://localhost:5000/api/health

`npm run setup` installs the root tools, the React app in `client`, and the Express API in `server`.

## MongoDB

The homepage works without a database. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` when the Atlas database is ready. Do not commit `server/.env`.

## Folders

- `client` — React, Vite, and Tailwind. This is what people see in the browser.
- `server` — Express and Mongoose. This will hold accounts, products, and orders.

The current build is the homepage and a health check. Sign-in, listings, and checkout are not part of this step.

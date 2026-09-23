# Maria To-Do — Setup Guide
Follow these steps in order. Takes ~30 minutes total.

---

## Step 1 — Put the project on GitHub

1. Go to github.com → sign in or create a free account
2. Click **New repository** → name it `maria-todo` → set to **Public** → Create
3. Upload all these files (drag & drop into the repo page):
   - `index.html`
   - `vercel.json`
   - `package.json`
   - the `api/` folder with `tasks.js` and `slack.js`

---

## Step 2 — Deploy to Vercel

1. Go to vercel.com → **Sign up with GitHub**
2. Click **Add New Project** → import your `maria-todo` repo
3. Click **Deploy** (default settings are fine)
4. Once deployed, copy your URL — it looks like `https://maria-todo-abc123.vercel.app`

---

## Step 3 — Add Vercel KV (database)

1. In your Vercel project → go to **Storage** tab
2. Click **Create Database** → choose **KV**
3. Name it `maria-tasks` → Create
4. Vercel auto-adds the connection env vars — nothing else needed here

---

## Step 4 — Set environment variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** → add these:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (from console.anthropic.com) |
| `API_SECRET` | Make up a long random password, e.g. `maria-secret-2026-xk9` |
| `SLACK_BOT_TOKEN` | You'll get this in Step 5 — come back and add it |

After adding, go to **Deployments** → **Redeploy** so the vars take effect.

---

## Step 5 — Create your Slack bot

1. Go to **api.slack.com/apps** → **Create New App** → **From scratch**
2. Name it `Maria Tasks` → choose your workspace → Create
3. In the left menu → **OAuth & Permissions**:
   - Under **Bot Token Scopes**, add: `chat:write`, `im:history`, `im:read`
   - Click **Install to Workspace** → Allow
   - Copy the **Bot User OAuth Token** (starts with `xoxb-`)
   - → Paste this as `SLACK_BOT_TOKEN` in Vercel (Step 4)
4. In the left menu → **Event Subscriptions** → turn **ON**
   - Request URL: `https://YOUR-PROJECT.vercel.app/api/slack`
   - Vercel will auto-verify it ✓
   - Under **Subscribe to bot events** → add `message.im`
   - Save Changes
5. In the left menu → **App Home** → turn on **Allow users to send Slash commands and messages from the messages tab**

---

## Step 6 — Update index.html with your URL

Open `index.html`, find this line near the bottom:
```
const API_BASE = window.VERCEL_URL || 'https://YOUR-PROJECT.vercel.app';
const API_SECRET = window.API_SECRET || 'REPLACE_WITH_YOUR_SECRET';
```
Replace with your actual Vercel URL and the secret you made up in Step 4.
Re-upload to GitHub → Vercel auto-redeploys.

---

## Step 7 — Test it!

1. In Slack, find **Maria Tasks** in Apps (left sidebar → Apps → search for it)
2. Send a DM: `Agregar: Medtronic — follow up con Victor Rivera sobre CD writing`
3. Check your to-do page — it should appear within seconds ✓

---

## How to send tasks from Slack

**Add a task:**
```
Agregar: Medtronic — follow up con Victor Rivera sobre CD writing
```
```
Add: Atlantic Health — scenario planning, contacto John Stoll, alta prioridad
```

**With subtasks:**
```
Agregar: RWBJ — motion request
- Subtarea 1: revisar brief
- Subtarea 2: confirmar con Erica
```

**Claude understands Spanish and English** — just talk naturally.

---

## Checking things off

Just click any task or subtask directly on the page. It saves instantly.

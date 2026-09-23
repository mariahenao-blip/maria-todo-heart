# Maria To-Do

A personal task manager built for Maria — organized by client, week, and contact.

## Live URL
https://maria-todo-heart-hnln2bj5e-m-0257.vercel.app

## What it does
- Tasks organized by client (30 clients, each with a unique color)
- Grouped by week with smart labels: Current week, Last week, Next week, Future week, Past week
- Collapsible week sections
- Click any title or contact to edit inline
- Right-click any task → Add subtask / Move to week / Delete
- Hover over subtask → delete button appears
- Auto-archive: past weeks where all tasks are done collapse to archive
- Daily rotating quote from Borges, Neruda, García Márquez, Rulfo, Woolf, Pessoa, Dickinson, Blanca Varela, Mary Oliver
- Green + button to add new tasks with subtasks
- All data saved in browser localStorage

## How to deploy
1. Upload `index.html` to your GitHub repo as the only file
2. Connect repo to Vercel (free)
3. Vercel auto-deploys on every GitHub push

## How to update tasks
1. Download `index.html` from GitHub
2. Open in browser to test
3. Re-upload to GitHub → Vercel auto-redeploys in ~30 seconds

## Slack integration (in progress)
Using Make.com to connect:
Slack message → Claude API (parses task) → updates to-do page

## Tech stack
- Pure HTML/CSS/JavaScript — no framework
- localStorage for persistence
- Hosted on Vercel (free tier)
- No backend needed

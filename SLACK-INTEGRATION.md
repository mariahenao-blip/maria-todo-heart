# Slack Integration via Make.com

## How it works
1. You post a task in a private Slack channel (e.g. #maria-tasks)
2. Make.com catches the message
3. Sends it to Claude API to parse
4. Claude returns structured task data
5. Make.com adds it to your to-do page

## Setup steps (once Make.com account is ready)

### Step 1 — Create a Slack channel
- Create a private channel called `#maria-tasks` in your Slack workspace
- This is just for you — no bot install needed at company level

### Step 2 — Make.com scenario
Create a new scenario with these modules:
1. **Slack → Watch Messages** (watches #maria-tasks)
2. **HTTP → Make a request** (calls Claude API)
3. **Tools → Parse JSON** (reads Claude's response)
4. **HTTP → Make a request** (updates your Vercel page)

### Step 3 — Claude API prompt
Use this system prompt in the HTTP module:

```
You are Maria's task manager. Parse the following message and return ONLY valid JSON:
{
  "title": "task title",
  "client": "client name from: Airbnb, Anaplan, Atlantic Health, Baptist Health, Behr, Boost Mobile, Compass, DirecTV, GAP, GE Healthcare, Greenshield, Inova, Kirkland, LHH, Link, Medtronic, Moore, NBCU, Northwell, RWBJ, RWJF, SharkNinja, Stripe, TaylorMade, The Christ Hospital, Trupanion, Twilio, Vail, WellMed, World Bank, Internal",
  "clientKey": "css key (e.g. atlantic, medtronic, rwbj)",
  "contact": "person name or null",
  "week": "YYYY-MM-DD format of the Monday of the relevant week",
  "subtasks": ["subtask 1", "subtask 2"] or []
}
```

### How to send tasks from Slack
Post in #maria-tasks like:
```
Medtronic — follow up con Victor Rivera sobre CD writing
Atlantic Health — scenario planning, contacto John Stoll
RWBJ — motion request, subtasks: revisar brief, confirmar con Erica
```

## API keys needed
- Anthropic API key: get from console.anthropic.com
- Slack token: from your Slack app settings

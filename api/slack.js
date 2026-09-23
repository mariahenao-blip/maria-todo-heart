// api/slack.js — receives Slack DMs, calls Claude to parse, saves task
const { kv } = require('@vercel/kv');

const TASKS_KEY = 'maria_tasks';

const CLIENTS = [
  'airbnb','anaplan','atlantic health','baptist health','behr','boost mobile',
  'compass','directv','gap','ge healthcare','greenshield','inova','kirkland',
  'lhh','link','medtronic','moore','nbcu','northwell','rwbj','rwjf',
  'sharkninja','stripe','taylormade','the christ hospital','trupanion',
  'twilio','vail','wellmed','world bank'
];

const CLIENT_KEYS = {
  'airbnb': 'airbnb', 'anaplan': 'anaplan', 'atlantic health': 'atlantic',
  'baptist health': 'baptist', 'behr': 'behr', 'boost mobile': 'boost',
  'compass': 'compass', 'directv': 'directv', 'gap': 'gap',
  'ge healthcare': 'gehealthcare', 'greenshield': 'greenshield', 'inova': 'inova',
  'kirkland': 'kirkland', 'lhh': 'lhh', 'link': 'link', 'medtronic': 'medtronic',
  'moore': 'moore', 'nbcu': 'nbcu', 'northwell': 'northwell', 'rwbj': 'rwbj',
  'rwjf': 'rwjf', 'sharkninja': 'sharkninja', 'stripe': 'stripe',
  'taylormade': 'taylormade', 'the christ hospital': 'christhospital',
  'trupanion': 'trupanion', 'twilio': 'twilio', 'vail': 'vail',
  'wellmed': 'wellmed', 'world bank': 'worldbank'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body;

  // Slack URL verification challenge
  if (body.type === 'url_verification') {
    return res.status(200).json({ challenge: body.challenge });
  }

  // Only handle direct messages to the bot
  const event = body.event;
  if (!event || event.type !== 'message' || event.bot_id || event.subtype) {
    return res.status(200).end();
  }

  // Only act on DMs (channel type = 'im')
  if (event.channel_type !== 'im') return res.status(200).end();

  const userMessage = event.text?.trim();
  if (!userMessage) return res.status(200).end();

  // Respond immediately to Slack (3s timeout requirement)
  res.status(200).end();

  try {
    // Call Claude to parse the message
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are Maria's task manager assistant. Maria works in a creative staffing agency with these clients: ${CLIENTS.join(', ')}.

When Maria sends you a message, extract task info and respond ONLY with valid JSON (no markdown, no explanation):
{
  "action": "add" | "done" | "delete" | "unclear",
  "task": {
    "title": "the task description",
    "client": "exact client name from the list, or 'internal' if not client-specific",
    "clientKey": "the css key for the client (e.g. 'atlantic', 'medtronic', 'rwbj')",
    "contact": "person mentioned as point of contact, or null",
    "week": "Sep 14" or "Sep 21" or whatever week Maria mentions, default to current week,
    "priority": "high" | "med" | "low",
    "subtasks": ["subtask 1", "subtask 2"] or []
  },
  "confirmMessage": "A short friendly confirmation in Spanish or English matching Maria's language, e.g. '✅ Agregué la tarea de Medtronic con Victor Rivera.'"
}

If the message is "done with X" or "completed X" or similar, set action to "done".
If unclear what to do, set action to "unclear" and confirmMessage explaining what you need.`,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content[0].text.trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Claude returned something unexpected
      await sendSlackMessage(event.channel, "Hmm, no pude entender eso. Intenta: *Agregar: [cliente] — [tarea] — [contacto]*");
      return;
    }

    if (parsed.action === 'add' && parsed.task) {
      // Save to KV
      const tasks = await kv.get(TASKS_KEY) || [];
      const newTask = {
        id: Date.now().toString(),
        title: parsed.task.title,
        client: parsed.task.client,
        clientKey: parsed.task.clientKey || 'internal',
        contact: parsed.task.contact || null,
        week: parsed.task.week || getCurrentWeek(),
        priority: parsed.task.priority || 'med',
        subtasks: (parsed.task.subtasks || []).map((s, i) => ({
          id: `${Date.now()}-${i}`,
          title: s,
          done: false
        })),
        done: false,
        created: new Date().toISOString()
      };
      tasks.unshift(newTask);
      await kv.set(TASKS_KEY, tasks);
      await sendSlackMessage(event.channel, parsed.confirmMessage || '✅ Tarea agregada.');
    } else if (parsed.action === 'unclear') {
      await sendSlackMessage(event.channel, parsed.confirmMessage || 'No entendí. ¿Puedes darme más detalles?');
    } else {
      await sendSlackMessage(event.channel, parsed.confirmMessage || '✅ Listo.');
    }

  } catch (err) {
    console.error('Error:', err);
    await sendSlackMessage(event.channel, '❌ Algo salió mal. Intenta de nuevo.');
  }
}

async function sendSlackMessage(channel, text) {
  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({ channel, text })
  });
}

function getCurrentWeek() {
  const now = new Date();
  return now.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

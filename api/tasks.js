// api/tasks.js — GET all tasks, POST add task, PATCH toggle done, DELETE remove task
const { kv } = require('@vercel/kv');

const TASKS_KEY = 'maria_tasks';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Simple auth check
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const tasks = await kv.get(TASKS_KEY) || [];
    return res.status(200).json(tasks);
  }

  if (req.method === 'POST') {
    // Add a new task
    const tasks = await kv.get(TASKS_KEY) || [];
    const task = {
      id: Date.now().toString(),
      ...req.body,
      done: false,
      created: new Date().toISOString()
    };
    tasks.unshift(task);
    await kv.set(TASKS_KEY, tasks);
    return res.status(200).json(task);
  }

  if (req.method === 'PATCH') {
    // Toggle done
    const { id } = req.body;
    const tasks = await kv.get(TASKS_KEY) || [];
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    task.done = !task.done;
    await kv.set(TASKS_KEY, tasks);
    return res.status(200).json(task);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    let tasks = await kv.get(TASKS_KEY) || [];
    tasks = tasks.filter(t => t.id !== id);
    await kv.set(TASKS_KEY, tasks);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

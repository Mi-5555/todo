require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let todos = []; // In-memory DB

// Root route to confirm backend is running
app.get('/', (req, res) => {
  res.send('Todo Summary Backend is running.');
});

// GET /todos
app.get('/todos', (req, res) => {
  console.log('GET /todos called');
  res.json(todos);
});

// POST /todos
app.post('/todos', (req, res) => {
  console.log('POST /todos called');
  console.log('Body:', req.body);

  const { text } = req.body;
  if (!text) {
    console.log('Error: Text is required');
    return res.status(400).json({ error: 'Text is required' });
  }

  const newTodo = { id: uuidv4(), text, completed: false };
  todos.push(newTodo);
  console.log('Added new todo:', newTodo);
  res.status(201).json(newTodo);
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  console.log('DELETE /todos/:id called', req.params.id);
  const { id } = req.params;
  const prevLength = todos.length;
  todos = todos.filter(todo => todo.id !== id);

  if (todos.length === prevLength) {
    console.log(`Todo with id ${id} not found`);
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.status(204).send();
});

// PUT /todos/:id
app.put('/todos/:id', (req, res) => {
  console.log('PUT /todos/:id called', req.params.id);
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) {
    console.log(`Todo with id ${id} not found`);
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[index].text = text;
  console.log('Updated todo:', todos[index]);
  res.json(todos[index]);
});

// POST /summarize
app.post('/summarize', async (req, res) => {
  try {
    console.log("✅ /summarize called");
    console.log("🔑 OpenAI key loaded:", !!process.env.OPENAI_API_KEY);
    console.log("🔗 Slack URL loaded:", !!process.env.SLACK_WEBHOOK_URL);

    const pendingTodos = todos.filter(todo => !todo.completed).map(t => t.text).join("\n");

    if (!pendingTodos) {
      return res.json({ message: 'No pending todos to summarize.' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Summarize the following todos:\n" + pendingTodos }
      ]
    });

    const summary = gptResponse.choices[0].message.content;
    console.log("🧠 OpenAI summary generated:", summary);

    const slackResponse = await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: summary,
    });

    console.log("📤 Slack response:", slackResponse.status, slackResponse.statusText);

    res.json({ message: 'Summary sent to Slack successfully.' });
  } catch (err) {
    console.error("🔥 Error in /summarize:", err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to summarize or send to Slack.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

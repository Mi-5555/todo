# Todo Summary Assistant

**Todo Summary Assistant** is a full-stack web application that enables users to manage personal to-do items, generate meaningful summaries using a Large Language Model (LLM), and send those summaries to a Slack channel.

---

## Features

- Add, edit, and delete to-do items
- View a list of current to-dos
- Generate a summary of pending tasks using the OpenAI API
- Send the generated summary to a Slack channel via webhook
- Integration with Supabase or Firebase for backend and database
- Responsive user interface built with React

---

## Tech Stack

| Layer     | Technology           |
|-----------|----------------------|
| Frontend  | React.js             |
| Backend   | Node.js + Express.js |
| LLM API   | OpenAI API           |
| Messaging | Slack Webhooks       |
| Database  | Supabase (PostgreSQL) or Firebase Firestore |
| Hosting   | (Optional: Vercel, Firebase, or Netlify)     |

---

## Architecture Overview

```mermaid
graph TD
  A[React Frontend] -->|REST API Calls| B[Express Backend]
  B --> C[(Supabase DB)]
  B --> D[OpenAI API]
  B --> E[Slack Webhook]

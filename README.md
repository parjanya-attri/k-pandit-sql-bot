# Next.js MSSQL Chat Dashboard with OpenAI Agents

This project is a modern, production-grade chat dashboard that allows users to interact with a Microsoft SQL Server (MSSQL) database using natural language, powered by an LLM agent (OpenAI Agents SDK). All database logic is handled natively in TypeScript/Node.js—no Python server required.

---

## Features

- **Modern, responsive chat UI** (Next.js + HeroUI + Tailwind)
- **Natural language to SQL**: LLM agent interprets user queries and uses tools to interact with MSSQL
- **Direct TypeScript MSSQL tools**: List tables, read table, execute SELECT queries (with validation)
- **All LLM responses in Markdown**: Rendered beautifully in the chat UI
- **Step-by-step agent tracing**: See every reasoning step and tool call for each response
- **Secure, production-ready**: Env-based config, SQL injection protection, error handling

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment setup

Create a `.env` file in the project root with your MSSQL credentials:

```
MSSQL_USER=your_user
MSSQL_PASSWORD=your_password
MSSQL_SERVER=your_server
MSSQL_DATABASE=your_database
MSSQL_PORT=1433
MSSQL_ENCRYPT=true
```

### 3. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the chat dashboard.

---

## How It Works

- The **frontend** is a Next.js app with a chat UI. User messages are sent to `/api/chat`.
- The **backend** uses the OpenAI Agents JS SDK to run an LLM agent with custom TypeScript tools:
  - `listTablesTool`: List all tables in the database
  - `readTableTool`: Read up to 100 rows from a table (with table name validation)
  - `executeSQLTool`: Execute SELECT queries (with input validation)
- The agent interprets user intent, reasons step-by-step, and calls tools as needed.
- **All responses are returned in Markdown** (tables, code, lists, etc.).
- The frontend uses [`react-markdown`](https://github.com/remarkjs/react-markdown) to render Markdown beautifully in the chat.

---

## Markdown Rendering

- All LLM responses are formatted as Markdown.
- The chat UI uses `react-markdown` to render tables, code blocks, lists, and more.
- No extra work is needed—just send Markdown from the backend and it will be rendered.

---

## Tracing & Step-by-Step Reasoning

- The OpenAI Agents SDK tracing is enabled by default.
- For every chat turn, the backend collects all reasoning steps and tool calls using a trace processor.
- The API returns a `steps` array for each response, showing exactly how the agent reasoned and which tools it used.
- You can display these steps in the UI for transparency/debugging.

---

## Security Notes

- All sensitive config is loaded from environment variables.
- Table names and queries are validated to prevent SQL injection.
- Only SELECT queries are allowed in the execute tool for safety.
- Errors are logged and user-friendly messages are returned.

---

## Extending the System

- **Add new tools**: Create new TypeScript functions and wrap them with the `tool()` helper from `@openai/agents`.
- **Customize the agent**: Edit the instructions, add more tools, or change the model in `app/api/chat/route.ts` and `constants.ts`.
- **Frontend**: The chat UI is fully customizable and uses localStorage for session persistence.

---

## Deployment

- Set all required environment variables in your production environment.
- Build and start the app:
  ```bash
  npm run build
  npm start
  ```
- For best security, use a secrets manager for environment variables.

---

## References

- [OpenAI Agents JS SDK: Function Tools](https://openai.github.io/openai-agents-js/guides/tools/#2-function-tools)
- [OpenAI Agents JS SDK: Tracing](https://openai.github.io/openai-agents-js/guides/tracing/)
- [react-markdown](https://github.com/remarkjs/react-markdown)

---

## License

Licensed under the [MIT license](https://github.com/heroui-inc/heroui/next-app-template/blob/main/LICENSE).

# AI Debate

[![JavaScript checks](https://github.com/SeanLee12345/ai-debate/actions/workflows/checks.yml/badge.svg)](https://github.com/SeanLee12345/ai-debate/actions/workflows/checks.yml)

A real-time debate application built to explore whether AI can help people focus on the substance of an argument. Participants join opposing sides and exchange claims through a browser interface. The server includes the original OpenAI claim-evaluation hook.

The idea grew from frustration with discussions where emotional appeals, confident delivery, and procedural rules overshadowed the quality of the argument. The goal was to give both sides a consistent way to examine claims during the conversation.

## Features

- Browser-based chat with opposing-side room matching.
- Account profiles, debate outcomes, wins, and trophies.
- MySQL conversation records and an AI-response field.
- A `send_to_ai` hook for claim evaluation alongside live messages.

## Stack

Node.js, Express, Socket.IO, MySQL, and browser JavaScript.

## Local Setup

Requires Node.js 20.6+ and a local MySQL database.

```sh
npm install
cp .env.example .env
mysql -u root -p < schema.sql
npm start
```

Set your local database credentials in `.env`, then open [localhost:5000](http://localhost:5000). The included schema uses `ai_debate`; adjust both the schema and `DB_NAME` if using another database.

## AI Integration

The original claim-evaluation prompt asked OpenAI whether a participant's statement was true. Its completion call is currently commented out in `send_to_ai`; chat and database code remain independent of that hook. To enable AI assessments, connect a current model API on the server and keep credentials in environment variables.

## Development

```sh
npm run check
```

This checks JavaScript syntax. Full chat testing uses two browser sessions and the local MySQL setup above.

## Origin and Credits

The project began with Python chat experiments in December 2022 and developed into this browser-based debate application in early 2023. This public repository is a clean source export; the original Git history remains in the private development repositories.

Original development includes commits by SeanLee12345, ScottLee12345, and zolid. The browser application was developed from [ScottLee12345/Debate](https://github.com/ScottLee12345/Debate). This export preserves the original application logic while replacing local credentials with configuration and adding setup documentation.

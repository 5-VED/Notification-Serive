# Notification Service

A TypeScript/Node.js service for multi-channel notifications (Email, In‑App, Push). It consumes domain events from Kafka, optionally fans them out to RabbitMQ per-channel queues, and delivers via channel workers. The service also exposes basic HTTP APIs and uses structured logging.

## Features
- Express + TypeScript with centralized validation and error handling
- PostgreSQL via sequelize-typescript; Redis client ready
- Kafka consumers for domain events (e.g., OTP, user lifecycle)
- RabbitMQ topic exchange and per-channel queues (DLQ-ready topology)
- Email delivery via Nodemailer + HTML templates
- Winston logging to console and date-partitioned files

## Architecture
High-level flow:
1. Upstream services publish domain events to Kafka (e.g., `user.created`, `notifications.email.otp`).
2. Notification-Service Kafka consumers ingest those events.
3. A fanout worker publishes channel-specific messages to RabbitMQ:
   - Exchange: `notifications` (type: topic)
   - Routing keys: `notifications.email.*`, `notifications.inapp.*`, `notifications.push.*`
4. Channel queue workers consume and deliver through adapters (Email/Push/In‑App).

### Runtime components
- HTTP Server (Express)
  - Security middleware (helmet, hpp, cors), JSON/body parsing, cookie parser
  - Routes under `/api/v1`, health endpoint under `/health`
  - Central 404 + error handler
- Kafka Workers
  - Example email worker for OTP
  - Fanout worker: Kafka → RabbitMQ routing by channel
- RabbitMQ Workers (per channel)
  - Email: send via Nodemailer and templates
  - In‑App: persist/display (placeholder; integrate with DB/Redis)
  - Push: integrate with FCM/APNs/Expo (placeholder)

## Repository layout
```
src/
  app.ts                      # Express application setup
  server.ts                   # Entry point; starts server and workers
  Config/
    config.ts                 # Environment → typed config
    Logger.ts                 # Winston logger
    Nodemailer.ts             # SMTP transporter
    Kafka/                    # Kafka producer/consumer utilities
    RabbitMQ/                 # RMQ connection, producer, consumer helpers
  Orchestrator/
    orchestrator.service.ts   # Email orchestration + templates
  Channels/
    email.adapter.ts          # Nodemailer adapter
  Templates/
    template.service.ts       # Email template rendering
  Worker/
    email.worker.ts           # Example Kafka OTP email consumer
    fanout.worker.ts          # Kafka → RabbitMQ fanout (routing)
  Routers/, Controllers/, Services/, Repository/, Models/  # HTTP + data layers
```

## Configuration
Environment variables are parsed via `dotenv` + `dotenv-parse-variables`. Common settings:

- Server
  - `PORT` (default 3001), `NODE_ENV` (development|production|test)
- Database
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- JWT
  - `JWT_SECRET`, `JWT_EXPIRES_IN`
- SMTP (Nodemailer)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (ensure `secure` matches port)
- Kafka
  - `KAFKA_BROKERS` (comma-separated)
  - Optional: `KAFKA_CLIENT_ID`, `KAFKA_FANOUT_GROUP_ID`, `KAFKA_TOPIC_FANOUT`, `KAFKA_TOPIC_EMAIL_OTP`
- RabbitMQ
  - `RABBITMQ_URL`
- Redis (optional)
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_TLS`

## Install & run
Prerequisites: Node 18+, access to Kafka, RabbitMQ, Postgres (and optional Redis).

Install dependencies:
```bash
npm ci
```

Build and run:
```bash
npm run build
npm start
# or development
npm run start:dev
```

## HTTP API (excerpt)
Base path: `/api/v1`
- POST `/user/signup` – create user
- POST `/user/login` – login, returns JWT
- GET `/health` – health and basic metrics

Validation uses class-validator DTOs; errors are handled by a global middleware.

## Messaging flows

### Kafka → fanout (Kafka → RabbitMQ)
The fanout worker subscribes to a Kafka topic (default `user.created`) and publishes per-channel messages to RabbitMQ `notifications` exchange.

Email-only example payload (produced to Kafka):
```json
{
  "eventType": "user.created",
  "channels": ["email"],
  "email": {
    "to": "user@example.com",
    "template": "welcome",
    "variables": {
      "name": "Jane",
      "email": "user@example.com",
      "signupDate": "2025-09-25",
      "dashboardUrl": "https://app.example.com/dashboard"
    }
  },
  "traceId": "t-123"
}
```
Fanout publishes to exchange `notifications` with routing key `notifications.email.welcome`.

### RabbitMQ topology (DLQ-ready)
A helper sets up exchanges, queues, and bindings:
- Exchanges: `notifications` (topic), `notifications.dlq` (topic)
- Queues: `emailNotifications`, `inAppNotifications`, `pushNotifications`
- DLQs: `emailNotifications.dlq`, `inAppNotifications.dlq`, `pushNotifications.dlq`
- Bindings:
  - `notifications.email.*` → `emailNotifications`
  - `notifications.inapp.*` → `inAppNotifications`
  - `notifications.push.*` → `pushNotifications`
  - `dlq.email` → `emailNotifications.dlq`, `dlq.inapp` → `inAppNotifications.dlq`, `dlq.push` → `pushNotifications.dlq`
- Main queues include dead-letter settings:
  - `x-dead-letter-exchange`: `notifications.dlq`
  - `x-dead-letter-routing-key`: `dlq.email|dlq.inapp|dlq.push`

### Channel consumers
- Email queue (`emailNotifications`):
  - Modes: (a) eventType + payload → Orchestrator (OTP, etc.), (b) template + variables + to → render + send, (c) direct to + subject + html.
- In‑App queue (`inAppNotifications`):
  - Extend to persist and display in-app messages; optionally push to WebSocket.
- Push queue (`pushNotifications`):
  - Integrate with FCM/APNs/Expo to deliver push notifications.

## Email templates
`Templates/template.service.ts` performs simple `{{variable}}` substitution in HTML templates.
- Included: `send_otp` and a rich `welcome` template
- Add more templates by extending the templates map and publishing with suitable routing keys

## Logging
Winston logs to console and daily log files under `logs/YYYY-MM-DD/`:
- `combined.log`
- `error.log`

## Troubleshooting
- Kafka: verify `KAFKA_BROKERS`, topics, and consumer group IDs
- RabbitMQ: ensure topology setup runs before publishing/consuming; verify bindings
- SMTP: confirm `SMTP_*` values and port/security settings; transporter verifies connectivity on boot
- Database: check `DB_*` values and connectivity

## Roadmap
- Add SMS adapter + queue worker
- Implement push delivery using FCM/APNs
- Add idempotency and retry backoff policies per queue
- Persist In‑App notifications + WebSocket fanout
- OpenAPI/Swagger documentation and API examples

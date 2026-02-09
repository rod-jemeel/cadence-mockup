# Email Cadence Assessment

TypeScript monorepo demonstrating email cadence workflows using Next.js + NestJS + Temporal.io.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind v4, shadcn/ui
- **Backend**: NestJS 11, in-memory storage
- **Workflow Engine**: Temporal.io TypeScript SDK
- **Monorepo**: pnpm workspaces + Turborepo
- **Testing**: Vitest (65 tests)

## Monorepo Structure

```
apps/
  web/        # Next.js frontend (port 3000)
  api/        # NestJS REST API (port 3001)
  worker/     # Temporal.io workflow worker
packages/
  shared/     # Shared TypeScript types
```

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start Temporal dev server (separate terminal)
temporal server start-dev

# 3. Start all apps
pnpm dev
```

Open http://localhost:3000 and sign in with any email/password.

## Prerequisites

- Node.js 18+
- pnpm 10+
- [Temporal CLI](https://docs.temporal.io/cli) (`temporal server start-dev`)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TEMPORAL_ADDRESS` | `localhost:7233` | Temporal server address |
| `TEMPORAL_NAMESPACE` | `default` | Temporal namespace |
| `TEMPORAL_TASK_QUEUE` | `email-cadence` | Task queue name |
| `API_PORT` | `3001` | NestJS API port |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | API URL for frontend |

## Running

Start all apps:

```bash
pnpm dev
```

Or individually:

```bash
pnpm dev:web      # Next.js on http://localhost:3000
pnpm dev:api      # NestJS on http://localhost:3001
pnpm dev:worker   # Temporal worker
```

## Testing

```bash
pnpm test
```

## API Endpoints

### Cadences

- `GET /cadences` - List all cadences
- `POST /cadences` - Create cadence
- `GET /cadences/:id` - Get cadence by ID
- `PUT /cadences/:id` - Update cadence

### Enrollments

- `GET /enrollments` - List all enrollments
- `POST /enrollments` - Start workflow enrollment
- `GET /enrollments/:id` - Get enrollment state (queries Temporal)
- `POST /enrollments/:id/update-cadence` - Signal running workflow with new steps

## Example API Calls

### Create a cadence

```bash
curl -X POST http://localhost:3001/cadences \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Flow",
    "steps": [
      { "id": "1", "type": "SEND_EMAIL", "subject": "Welcome", "body": "Hello there" },
      { "id": "2", "type": "WAIT", "seconds": 10 },
      { "id": "3", "type": "SEND_EMAIL", "subject": "Follow up", "body": "Checking in" }
    ]
  }'
```

### Enroll a contact

```bash
curl -X POST http://localhost:3001/enrollments \
  -H "Content-Type: application/json" \
  -d '{ "cadenceId": "<cadence-id>", "contactEmail": "user@example.com" }'
```

### Check enrollment status

```bash
curl http://localhost:3001/enrollments/<enrollment-id>
```

### Update cadence mid-flight

```bash
curl -X POST http://localhost:3001/enrollments/<enrollment-id>/update-cadence \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      { "id": "1", "type": "SEND_EMAIL", "subject": "Welcome v2", "body": "Updated hello" },
      { "id": "4", "type": "SEND_EMAIL", "subject": "New step", "body": "Added step" }
    ]
  }'
```

## Workflow Update Rules

When updating a running workflow's cadence steps:

1. Already completed steps remain completed
2. `currentStepIndex` is preserved
3. If new steps length <= `currentStepIndex`, workflow marks as COMPLETED
4. Otherwise, continue from `currentStepIndex` using new steps
5. `stepsVersion` is incremented

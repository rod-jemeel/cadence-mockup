# Email Cadence Assessment - Comprehensive Implementation Plan

## Overview

Transform the current Next.js 16 template into a **TypeScript monorepo** with three apps:
- **apps/web** - Next.js 16 frontend (existing template, moved)
- **apps/api** - NestJS REST API (new)
- **apps/worker** - Temporal.io workflow worker (new)
- **packages/shared** - Shared types/contracts (new)

---

## Phase 0: Monorepo Scaffolding

### 0.1 Root Configuration

**pnpm-workspace.yaml**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Root package.json** scripts:
```json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "turbo dev --filter=web",
    "dev:api": "turbo dev --filter=api",
    "dev:worker": "turbo dev --filter=worker",
    "build": "turbo build",
    "lint": "turbo lint"
  }
}
```

**turbo.json** (lightweight, no remote caching needed for assessment):
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "persistent": true, "cache": false },
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "lint": {}
  }
}
```

**tsconfig.base.json** (shared compiler options):
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 0.2 Move Existing Template to apps/web

1. Create `apps/web/` directory
2. Move all current Next.js files: `app/`, `components/`, `lib/`, `public/`, `docs/`
3. Move configs: `next.config.ts`, `tsconfig.json`, `components.json`, `eslint.config.mjs`
4. Update `apps/web/package.json` with name `"web"` and existing dependencies
5. Update `apps/web/tsconfig.json` to extend `../../tsconfig.base.json`
6. Add `@repo/shared` as workspace dependency

### 0.3 Create packages/shared

Shared type contract used by all three apps.

```
packages/shared/
  src/
    index.ts              # Re-exports all types
    cadence.types.ts      # Cadence and Step types
    enrollment.types.ts   # Enrollment types
    workflow.types.ts     # Workflow state types
  package.json
  tsconfig.json
```

---

## Phase 1: Shared Types (packages/shared)

### 1.1 Cadence Payload Contract (REQUIRED - from spec)

```typescript
// packages/shared/src/cadence.types.ts

export type StepType = "SEND_EMAIL" | "WAIT";

export interface SendEmailStep {
  id: string;
  type: "SEND_EMAIL";
  subject: string;
  body: string;
}

export interface WaitStep {
  id: string;
  type: "WAIT";
  seconds: number;
}

export type CadenceStep = SendEmailStep | WaitStep;

export interface Cadence {
  id: string;
  name: string;
  steps: CadenceStep[];
}
```

### 1.2 Enrollment Types

```typescript
// packages/shared/src/enrollment.types.ts

export type EnrollmentStatus = "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface CreateEnrollmentRequest {
  cadenceId: string;
  contactEmail: string;
}

export interface EnrollmentState {
  enrollmentId: string;
  cadenceId: string;
  contactEmail: string;
  status: EnrollmentStatus;
  currentStepIndex: number;
  stepsVersion: number;
  steps: CadenceStep[];
}
```

### 1.3 Workflow Types

```typescript
// packages/shared/src/workflow.types.ts

export interface WorkflowState {
  status: EnrollmentStatus;
  currentStepIndex: number;
  stepsVersion: number;
  steps: CadenceStep[];
  contactEmail: string;
  cadenceId: string;
}

export interface MockEmailResult {
  success: true;
  messageId: string;
  timestamp: number;
}
```

---

## Phase 2: NestJS API (apps/api)

### 2.1 File Structure

```
apps/api/
  src/
    main.ts                          # Bootstrap NestJS app
    app.module.ts                    # Root module
    app.controller.ts                # Health check

    cadences/
      cadences.module.ts
      cadences.controller.ts         # POST, GET/:id, PUT/:id
      cadences.service.ts            # In-memory store
      dto/
        create-cadence.dto.ts
        update-cadence.dto.ts

    enrollments/
      enrollments.module.ts
      enrollments.controller.ts      # POST, GET/:id, POST/:id/update-cadence
      enrollments.service.ts         # Starts workflows, queries state
      dto/
        create-enrollment.dto.ts
        update-cadence-steps.dto.ts

    temporal/
      temporal.module.ts             # Global module
      temporal.service.ts            # Temporal client wrapper
      temporal.config.ts             # Connection config

    config/
      configuration.ts               # Environment config
      env.validation.ts

  package.json
  tsconfig.json
  nest-cli.json
```

### 2.2 API Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /cadences | `{ name, steps }` | Create cadence |
| GET | /cadences/:id | - | Get cadence |
| PUT | /cadences/:id | `{ name?, steps }` | Update cadence definition |
| POST | /enrollments | `{ cadenceId, contactEmail }` | Start Temporal workflow |
| GET | /enrollments/:id | - | Get current workflow status via query |
| POST | /enrollments/:id/update-cadence | `{ steps }` | Signal running workflow |

### 2.3 Storage Strategy

**In-memory Maps** (no database needed per spec):
- `cadences: Map<string, Cadence>` - stores cadence definitions
- `enrollments: Map<string, { cadenceId, contactEmail, workflowId }>` - maps enrollment to workflow

### 2.4 Temporal Client Integration

```typescript
// apps/api/src/temporal/temporal.service.ts
import { Client, Connection } from '@temporalio/client';

@Injectable()
export class TemporalService implements OnModuleInit {
  private client: Client;

  async onModuleInit() {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });
    this.client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    });
  }

  async startCadenceWorkflow(enrollmentId: string, cadence: Cadence, contactEmail: string) {
    return this.client.workflow.start('cadenceWorkflow', {
      taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'email-cadence',
      workflowId: `enrollment-${enrollmentId}`,
      args: [{ cadence, contactEmail }],
    });
  }

  async getWorkflowState(workflowId: string): Promise<WorkflowState> {
    const handle = this.client.workflow.getHandle(workflowId);
    return handle.query('getState');
  }

  async updateCadenceSteps(workflowId: string, steps: CadenceStep[]) {
    const handle = this.client.workflow.getHandle(workflowId);
    await handle.signal('updateCadence', steps);
  }
}
```

### 2.5 Dependencies

```json
{
  "@nestjs/common": "^11",
  "@nestjs/core": "^11",
  "@nestjs/platform-express": "^11",
  "@nestjs/config": "^4",
  "@temporalio/client": "^1",
  "class-validator": "^0.14",
  "class-transformer": "^0.5",
  "@repo/shared": "workspace:*"
}
```

---

## Phase 3: Temporal Worker (apps/worker)

### 3.1 File Structure

```
apps/worker/
  src/
    main.ts                    # Worker entry point
    worker.ts                  # Worker creation and configuration
    workflows/
      cadence.workflow.ts      # Main cadence workflow
    activities/
      email.activities.ts      # Mock email sending activity
  package.json
  tsconfig.json
```

### 3.2 Cadence Workflow (CORE LOGIC)

```typescript
// apps/worker/src/workflows/cadence.workflow.ts
import {
  proxyActivities,
  sleep,
  defineSignal,
  defineQuery,
  setHandler,
} from '@temporalio/workflow';
import type { CadenceStep, WorkflowState, EnrollmentStatus } from '@repo/shared';
import type * as activities from '../activities/email.activities';

const { sendMockEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export const updateCadenceSignal = defineSignal<[CadenceStep[]]>('updateCadence');
export const getStateQuery = defineQuery<WorkflowState>('getState');

interface CadenceWorkflowInput {
  cadence: { id: string; name: string; steps: CadenceStep[] };
  contactEmail: string;
}

export async function cadenceWorkflow(input: CadenceWorkflowInput): Promise<WorkflowState> {
  let steps = [...input.cadence.steps];
  let currentStepIndex = 0;
  let stepsVersion = 1;
  let status: EnrollmentStatus = 'RUNNING';

  // Signal handler: updateCadence
  setHandler(updateCadenceSignal, (newSteps: CadenceStep[]) => {
    steps = newSteps;
    stepsVersion++;
    // Rule: if new steps length <= currentStepIndex, mark COMPLETED
    if (steps.length <= currentStepIndex) {
      status = 'COMPLETED';
    }
  });

  // Query handler: getState
  setHandler(getStateQuery, (): WorkflowState => ({
    status,
    currentStepIndex,
    stepsVersion,
    steps,
    contactEmail: input.contactEmail,
    cadenceId: input.cadence.id,
  }));

  // Execute steps sequentially
  while (currentStepIndex < steps.length && status === 'RUNNING') {
    const step = steps[currentStepIndex];

    if (step.type === 'SEND_EMAIL') {
      await sendMockEmail({
        to: input.contactEmail,
        subject: step.subject,
        body: step.body,
      });
    } else if (step.type === 'WAIT') {
      await sleep(step.seconds * 1000); // Temporal sleep in ms
    }

    currentStepIndex++;

    // After incrementing, re-check bounds (steps may have been updated)
    if (currentStepIndex >= steps.length) {
      status = 'COMPLETED';
    }
  }

  if (status === 'RUNNING') {
    status = 'COMPLETED';
  }

  return {
    status,
    currentStepIndex,
    stepsVersion,
    steps,
    contactEmail: input.contactEmail,
    cadenceId: input.cadence.id,
  };
}
```

### 3.3 Mock Email Activity

```typescript
// apps/worker/src/activities/email.activities.ts
import type { MockEmailResult } from '@repo/shared';
import { v4 as uuidv4 } from 'uuid';

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

export async function sendMockEmail(input: SendEmailInput): Promise<MockEmailResult> {
  console.log(`[MOCK EMAIL] To: ${input.to} | Subject: ${input.subject} | Body: ${input.body}`);
  return {
    success: true,
    messageId: uuidv4(),
    timestamp: Date.now(),
  };
}
```

### 3.4 Worker Setup

```typescript
// apps/worker/src/worker.ts
import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities/email.activities';

export async function createWorker() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  return Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'email-cadence',
    workflowsPath: require.resolve('./workflows/cadence.workflow'),
    activities,
  });
}
```

### 3.5 Dependencies

```json
{
  "@temporalio/worker": "^1",
  "@temporalio/workflow": "^1",
  "@temporalio/activity": "^1",
  "uuid": "^9",
  "@repo/shared": "workspace:*"
}
```

---

## Phase 4: Next.js Frontend (apps/web)

### 4.1 New Routes to Add

```
app/(protected)/
  cadences/
    page.tsx                    # List all cadences
    _components/
      CadenceCard.tsx
      CadenceJsonEditor.tsx     # JSON textarea editor
    new/
      page.tsx                  # Create cadence form
    [cadenceId]/
      page.tsx                  # View/edit cadence
      _components/
        CadenceViewer.tsx

  enrollments/
    page.tsx                    # List enrollments
    _components/
      EnrollmentCard.tsx
      StatusBadge.tsx
    new/
      page.tsx                  # Start workflow (select cadence + email)
    [enrollmentId]/
      page.tsx                  # View workflow state (polling)
      _components/
        WorkflowStateViewer.tsx # Real-time step display
        WorkflowTimeline.tsx    # Visual step progress
```

### 4.2 API Client Layer

```
lib/api/
  client.ts                     # Fetch wrapper with base URL
  cadences.ts                   # CRUD for cadences
  enrollments.ts                # CRUD for enrollments
```

```typescript
// lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### 4.3 Workflow State Polling

```typescript
// lib/hooks/use-enrollment-state.ts
export function useEnrollmentState(enrollmentId: string) {
  const [state, setState] = useState<EnrollmentState | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await apiGet<EnrollmentState>(`/enrollments/${enrollmentId}`);
      setState(data);
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [enrollmentId]);

  return state;
}
```

### 4.4 Sidebar Navigation Updates

Add to AppSidebar:
- Cadences (list icon)
- Enrollments (play icon)

---

## Phase 5: Update Rules (Critical Business Logic)

These rules MUST be implemented in the workflow signal handler:

1. **Already completed steps remain completed** - do not re-execute steps before currentStepIndex
2. **Keep currentStepIndex** - the workflow continues from where it is
3. **If new steps length <= currentStepIndex, mark workflow COMPLETED** - shortened cadence that already passed the current point
4. **Else continue from currentStepIndex using new steps** - pick up the new definition mid-flight
5. **Increment stepsVersion** - track how many times the cadence was updated

---

## Phase 6: Integration & Configuration

### 6.1 Environment Variables

```env
# Temporal.io
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=email-cadence

# API
API_PORT=3001

# Web
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6.2 CORS Configuration (NestJS)

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000', // Next.js dev server
});
```

### 6.3 Port Configuration

| App | Port | Description |
|-----|------|-------------|
| web | 3000 | Next.js frontend |
| api | 3001 | NestJS REST API |
| worker | - | No HTTP server (connects to Temporal) |

---

## Phase 7: Final Monorepo Structure

```
repo/
  apps/
    web/                          # Next.js 16 (TypeScript)
      app/
        (auth)/                   # Public routes
        (protected)/              # Authenticated routes
          cadences/               # Cadence management
          enrollments/            # Enrollment management
          dashboard/
      components/ui/              # shadcn/ui
      lib/
        api/                      # HTTP client
        proto/                    # Mock auth/theme/storage
        hooks/                    # Custom hooks
      public/
      package.json
      next.config.ts
      tsconfig.json

    api/                          # NestJS (TypeScript)
      src/
        cadences/                 # Cadence CRUD module
        enrollments/              # Enrollment module
        temporal/                 # Temporal client module
        config/                   # Env config
        main.ts
        app.module.ts
      package.json
      tsconfig.json
      nest-cli.json

    worker/                       # Temporal.io Worker (TypeScript)
      src/
        workflows/
          cadence.workflow.ts     # Main workflow
        activities/
          email.activities.ts     # Mock email
        worker.ts
        main.ts
      package.json
      tsconfig.json

  packages/
    shared/                       # Shared types
      src/
        cadence.types.ts
        enrollment.types.ts
        workflow.types.ts
        index.ts
      package.json
      tsconfig.json

  docs/
    Email_Cadence_Assessment_Temporal_io_Monorepo.docx.md
    DESIGN-NOTES.md
    ui-ux-design-guide.md
    IMPLEMENTATION-PLAN.md

  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
  package.json
  CLAUDE.md
  README.md
```

---

## Implementation Order (Recommended)

1. **Phase 0**: Scaffold monorepo (pnpm-workspace.yaml, turbo.json, tsconfig.base.json, move web)
2. **Phase 1**: Create packages/shared with type contracts
3. **Phase 3**: Create apps/worker (workflow + activities) - can be developed independently
4. **Phase 2**: Create apps/api (NestJS with Temporal client)
5. **Phase 4**: Add cadence/enrollment UI to apps/web
6. **Phase 5**: Verify update rules work correctly
7. **Phase 6**: Integration testing with all three apps running

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo tool | Turborepo + pnpm | Required for assessment, lightweight config |
| Storage | In-memory Maps | No database needed per spec |
| UI complexity | Basic (JSON textarea OK) | Spec says "UI design is not important" |
| Auth | None | Spec says "No authentication required" |
| Email | Mock always-success | Spec requirement |
| Tests | None | Spec says "No test cases required" |
| Polling interval | 2 seconds | Good balance for workflow state display |

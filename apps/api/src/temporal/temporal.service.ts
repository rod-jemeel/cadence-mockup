import { Injectable, OnModuleInit, OnModuleDestroy, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Client, WorkflowHandle } from '@temporalio/client';
import type { Cadence, CadenceStep, CadenceWorkflowInput, WorkflowState } from '@repo/shared';

@Injectable()
export class TemporalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TemporalService.name);
  private client: Client | null = null;
  private connection: Connection | null = null;
  private connected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const address = this.configService.get<string>('temporal.address') ?? 'localhost:7233';
    this.logger.log(`Connecting to Temporal at ${address}`);

    try {
      this.connection = await Connection.connect({ address });
      this.client = new Client({
        connection: this.connection,
        namespace: this.configService.get<string>('temporal.namespace') ?? 'default',
      });
      this.connected = true;
      this.logger.log('Temporal client connected');
    } catch (err) {
      this.logger.warn(
        `Failed to connect to Temporal at ${address}. Enrollment features will be unavailable until Temporal is running.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close();
      this.logger.log('Temporal connection closed');
    }
  }

  private ensureConnected(): Client {
    if (!this.connected || !this.client) {
      throw new ServiceUnavailableException(
        'Temporal server is not available. Start Temporal and restart the API.',
      );
    }
    return this.client;
  }

  async startCadenceWorkflow(
    enrollmentId: string,
    cadence: Cadence,
    contactEmail: string,
  ): Promise<string> {
    const client = this.ensureConnected();
    const workflowId = `cadence-${enrollmentId}`;
    const taskQueue = this.configService.get<string>('temporal.taskQueue') ?? 'email-cadence';

    const input: CadenceWorkflowInput = {
      cadence,
      contactEmail,
    };

    await client.workflow.start('cadenceWorkflow', {
      taskQueue,
      workflowId,
      args: [input],
    });

    this.logger.log(`Started workflow ${workflowId} for enrollment ${enrollmentId}`);
    return workflowId;
  }

  async getWorkflowState(workflowId: string): Promise<WorkflowState> {
    const client = this.ensureConnected();
    const handle: WorkflowHandle = client.workflow.getHandle(workflowId);
    const state = await handle.query<WorkflowState>('getState');
    return state;
  }

  async updateCadenceSteps(workflowId: string, steps: CadenceStep[]): Promise<void> {
    const client = this.ensureConnected();
    const handle: WorkflowHandle = client.workflow.getHandle(workflowId);
    await handle.signal('updateCadence', steps);
    this.logger.log(`Sent updateCadence signal to workflow ${workflowId}`);
  }
}

import {
  proxyActivities,
  sleep,
  defineSignal,
  defineQuery,
  setHandler,
} from '@temporalio/workflow';
import type { CadenceStep, WorkflowState, EnrollmentStatus, CadenceWorkflowInput } from '@repo/shared';
import type * as activities from '../activities/email.activities';

const { sendMockEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1 second',
    backoffCoefficient: 2,
  },
});

export const updateCadenceSignal = defineSignal<[CadenceStep[]]>('updateCadence');
export const getStateQuery = defineQuery<WorkflowState>('getState');

export async function cadenceWorkflow(input: CadenceWorkflowInput): Promise<WorkflowState> {
  let steps = [...input.cadence.steps];
  let currentStepIndex = 0;
  let stepsVersion = 1;
  let status: EnrollmentStatus = 'RUNNING';

  // Signal handler: updateCadence - replaces steps mid-flight
  setHandler(updateCadenceSignal, (newSteps: CadenceStep[]) => {
    steps = newSteps;
    stepsVersion++;
    // Rule 3: if new steps length <= currentStepIndex, mark COMPLETED
    if (steps.length <= currentStepIndex) {
      status = 'COMPLETED';
    }
  });

  // Query handler: getState - returns current workflow state
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
      try {
        await sendMockEmail({
          to: input.contactEmail,
          subject: step.subject,
          body: step.body,
        });
      } catch {
        status = 'FAILED';
        break;
      }
    } else if (step.type === 'WAIT') {
      await sleep(step.seconds * 1000);
    }

    // Re-check status after await (signal may have fired during sleep/activity)
    if (status !== 'RUNNING') break;

    currentStepIndex++;

    // After incrementing, re-check (steps may have been updated via signal)
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

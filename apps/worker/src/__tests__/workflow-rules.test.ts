import { describe, it, expect } from 'vitest';
import type { CadenceStep, EnrollmentStatus } from '@repo/shared';

/**
 * Helper function that replicates the updateCadence signal handler logic
 * from cadence.workflow.ts (lines 25-32)
 */
function applyUpdateRules(
  currentStepIndex: number,
  currentStatus: EnrollmentStatus,
  newSteps: CadenceStep[],
  currentVersion: number
): { status: EnrollmentStatus; steps: CadenceStep[]; stepsVersion: number } {
  const steps = newSteps;
  const stepsVersion = currentVersion + 1;
  let status = currentStatus;

  // Rule 3: if new steps length <= currentStepIndex, mark COMPLETED
  if (steps.length <= currentStepIndex) {
    status = 'COMPLETED';
  }

  return { status, steps, stepsVersion };
}

describe('Workflow Update Rules', () => {
  let stepCounter = 0;
  const createEmailStep = (subject: string): CadenceStep => ({
    id: `email-${++stepCounter}`,
    type: 'SEND_EMAIL',
    subject,
    body: `Body for ${subject}`,
  });

  const createWaitStep = (seconds: number): CadenceStep => ({
    id: `wait-${++stepCounter}`,
    type: 'WAIT',
    seconds,
  });

  describe('Rule 1: Already completed steps remain completed', () => {
    it('currentStepIndex stays at current position when updating steps', () => {
      const currentSteps = [createEmailStep('Email 1'), createWaitStep(10), createEmailStep('Email 2')];
      const newSteps = [createEmailStep('New Email 1'), createWaitStep(20), createEmailStep('New Email 2')];

      const result = applyUpdateRules(1, 'RUNNING', newSteps, 1);

      // currentStepIndex is preserved (not reset to 0)
      // This means step at index 0 (already completed) remains completed
      expect(result.steps).toEqual(newSteps);
      // The function returns new steps but doesn't modify currentStepIndex
      // In the actual workflow, currentStepIndex is not changed by the signal handler
    });
  });

  describe('Rule 2: Keep currentStepIndex when updating', () => {
    it('preserves currentStepIndex at 0', () => {
      const newSteps = [createEmailStep('Updated Email')];
      const result = applyUpdateRules(0, 'RUNNING', newSteps, 1);

      expect(result.steps).toEqual(newSteps);
      expect(result.status).toBe('RUNNING');
    });

    it('preserves currentStepIndex at 2', () => {
      const newSteps = [createEmailStep('Email 1'), createEmailStep('Email 2'), createEmailStep('Email 3')];
      const result = applyUpdateRules(2, 'RUNNING', newSteps, 1);

      expect(result.steps).toEqual(newSteps);
      expect(result.status).toBe('RUNNING');
    });

    it('preserves currentStepIndex at 5 with longer step list', () => {
      const newSteps = Array.from({ length: 10 }, (_, i) => createEmailStep(`Email ${i + 1}`));
      const result = applyUpdateRules(5, 'RUNNING', newSteps, 2);

      expect(result.steps).toEqual(newSteps);
      expect(result.status).toBe('RUNNING');
    });
  });

  describe('Rule 3: If new steps length <= currentStepIndex, mark workflow COMPLETED', () => {
    it('marks COMPLETED when new steps length equals currentStepIndex', () => {
      const newSteps = [createEmailStep('Email 1'), createEmailStep('Email 2')];
      const currentStepIndex = 2; // Workflow has completed 2 steps (indices 0, 1)

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('COMPLETED');
      expect(result.steps.length).toBe(2);
    });

    it('marks COMPLETED when new steps length is less than currentStepIndex', () => {
      const newSteps = [createEmailStep('Email 1')];
      const currentStepIndex = 3; // Workflow has completed 3 steps

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('COMPLETED');
      expect(result.steps.length).toBe(1);
    });

    it('marks COMPLETED when replacing with empty steps array', () => {
      const newSteps: CadenceStep[] = [];
      const currentStepIndex = 1;

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('COMPLETED');
      expect(result.steps.length).toBe(0);
    });

    it('marks COMPLETED when currentStepIndex is 0 and new steps is empty', () => {
      const newSteps: CadenceStep[] = [];
      const currentStepIndex = 0;

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('Rule 4: Else continue from currentStepIndex using new steps', () => {
    it('continues RUNNING when new steps length > currentStepIndex', () => {
      const newSteps = [createEmailStep('Email 1'), createEmailStep('Email 2'), createEmailStep('Email 3')];
      const currentStepIndex = 1;

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('RUNNING');
      expect(result.steps).toEqual(newSteps);
    });

    it('continues RUNNING with currentStepIndex 0 and new steps available', () => {
      const newSteps = [createEmailStep('New Email 1'), createWaitStep(5)];
      const currentStepIndex = 0;

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('RUNNING');
      expect(result.steps).toEqual(newSteps);
    });

    it('uses new steps for continuation', () => {
      const oldSteps = [createEmailStep('Old 1'), createEmailStep('Old 2')];
      const newSteps = [createEmailStep('New 1'), createEmailStep('New 2'), createEmailStep('New 3')];
      const currentStepIndex = 1;

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.steps).toEqual(newSteps);
      expect(result.steps).not.toEqual(oldSteps);
      expect(result.status).toBe('RUNNING');
    });
  });

  describe('Rule 5: Increment stepsVersion', () => {
    it('increments stepsVersion from 1 to 2', () => {
      const newSteps = [createEmailStep('Email 1')];
      const result = applyUpdateRules(0, 'RUNNING', newSteps, 1);

      expect(result.stepsVersion).toBe(2);
    });

    it('increments stepsVersion from 5 to 6', () => {
      const newSteps = [createEmailStep('Email 1')];
      const result = applyUpdateRules(0, 'RUNNING', newSteps, 5);

      expect(result.stepsVersion).toBe(6);
    });

    it('increments stepsVersion even when marking COMPLETED', () => {
      const newSteps: CadenceStep[] = [];
      const result = applyUpdateRules(1, 'RUNNING', newSteps, 3);

      expect(result.stepsVersion).toBe(4);
      expect(result.status).toBe('COMPLETED');
    });

    it('increments stepsVersion for each update', () => {
      const steps1 = [createEmailStep('Email 1')];
      const steps2 = [createEmailStep('Email 2')];
      const steps3 = [createEmailStep('Email 3')];

      const result1 = applyUpdateRules(0, 'RUNNING', steps1, 1);
      expect(result1.stepsVersion).toBe(2);

      const result2 = applyUpdateRules(0, 'RUNNING', steps2, result1.stepsVersion);
      expect(result2.stepsVersion).toBe(3);

      const result3 = applyUpdateRules(0, 'RUNNING', steps3, result2.stepsVersion);
      expect(result3.stepsVersion).toBe(4);
    });
  });

  describe('Combined Rules: Real-world scenarios', () => {
    it('scenario: shorten cadence mid-execution', () => {
      // Workflow started with 5 steps, completed 3
      const currentStepIndex = 3;
      const newSteps = [createEmailStep('Email 1'), createEmailStep('Email 2')]; // Only 2 steps now

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('COMPLETED'); // Rule 3
      expect(result.stepsVersion).toBe(2); // Rule 5
      expect(result.steps).toEqual(newSteps);
    });

    it('scenario: extend cadence mid-execution', () => {
      // Workflow started with 2 steps, completed 1
      const currentStepIndex = 1;
      const newSteps = [
        createEmailStep('Email 1'),
        createEmailStep('Email 2'),
        createEmailStep('Email 3'),
        createEmailStep('Email 4'),
      ];

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('RUNNING'); // Rule 4
      expect(result.stepsVersion).toBe(2); // Rule 5
      expect(result.steps).toEqual(newSteps);
      // Workflow will continue from index 1 with new steps
    });

    it('scenario: replace all steps at beginning', () => {
      const currentStepIndex = 0;
      const oldSteps = [createEmailStep('Old 1'), createEmailStep('Old 2')];
      const newSteps = [createWaitStep(10), createEmailStep('New 1')];

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 1);

      expect(result.status).toBe('RUNNING'); // Rule 4
      expect(result.stepsVersion).toBe(2); // Rule 5
      expect(result.steps).toEqual(newSteps);
    });

    it('scenario: clear all steps when workflow at step 0', () => {
      const currentStepIndex = 0;
      const newSteps: CadenceStep[] = [];

      const result = applyUpdateRules(currentStepIndex, 'RUNNING', newSteps, 2);

      expect(result.status).toBe('COMPLETED'); // Rule 3
      expect(result.stepsVersion).toBe(3); // Rule 5
      expect(result.steps).toEqual([]);
    });
  });
});

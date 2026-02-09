import { describe, it, expect } from 'vitest';
import type {
  StepType,
  SendEmailStep,
  WaitStep,
  CadenceStep,
  Cadence,
  CreateCadenceRequest,
  UpdateCadenceRequest,
} from '../cadence.types';
import type {
  EnrollmentStatus,
  CreateEnrollmentRequest,
  Enrollment,
  EnrollmentState,
  UpdateCadenceStepsRequest,
} from '../enrollment.types';
import type {
  WorkflowState,
  MockEmailResult,
  CadenceWorkflowInput,
} from '../workflow.types';

describe('Cadence Types', () => {
  describe('StepType', () => {
    it('should accept valid step types', () => {
      const sendEmailType: StepType = 'SEND_EMAIL';
      const waitType: StepType = 'WAIT';

      expect(sendEmailType).toBe('SEND_EMAIL');
      expect(waitType).toBe('WAIT');
    });
  });

  describe('SendEmailStep', () => {
    it('should create valid SendEmailStep object', () => {
      const step = {
        id: 'step-1',
        type: 'SEND_EMAIL' as const,
        subject: 'Welcome!',
        body: 'Welcome to our platform',
      } satisfies SendEmailStep;

      expect(step.type).toBe('SEND_EMAIL');
      expect(step.id).toBe('step-1');
      expect(step.subject).toBe('Welcome!');
      expect(step.body).toBe('Welcome to our platform');
    });
  });

  describe('WaitStep', () => {
    it('should create valid WaitStep object', () => {
      const step = {
        id: 'step-2',
        type: 'WAIT' as const,
        seconds: 86400,
      } satisfies WaitStep;

      expect(step.type).toBe('WAIT');
      expect(step.id).toBe('step-2');
      expect(step.seconds).toBe(86400);
    });
  });

  describe('CadenceStep discriminated union', () => {
    it('should work with SendEmailStep', () => {
      const step: CadenceStep = {
        id: 'step-1',
        type: 'SEND_EMAIL',
        subject: 'Test',
        body: 'Test body',
      };

      expect(step.type).toBe('SEND_EMAIL');
      if (step.type === 'SEND_EMAIL') {
        expect(step.subject).toBe('Test');
        expect(step.body).toBe('Test body');
      }
    });

    it('should work with WaitStep', () => {
      const step: CadenceStep = {
        id: 'step-2',
        type: 'WAIT',
        seconds: 3600,
      };

      expect(step.type).toBe('WAIT');
      if (step.type === 'WAIT') {
        expect(step.seconds).toBe(3600);
      }
    });

    it('should allow mixed steps in array', () => {
      const steps: CadenceStep[] = [
        {
          id: 'step-1',
          type: 'SEND_EMAIL',
          subject: 'Email 1',
          body: 'Body 1',
        },
        {
          id: 'step-2',
          type: 'WAIT',
          seconds: 7200,
        },
        {
          id: 'step-3',
          type: 'SEND_EMAIL',
          subject: 'Email 2',
          body: 'Body 2',
        },
      ];

      expect(steps).toHaveLength(3);
      expect(steps[0].type).toBe('SEND_EMAIL');
      expect(steps[1].type).toBe('WAIT');
      expect(steps[2].type).toBe('SEND_EMAIL');
    });
  });

  describe('Cadence', () => {
    it('should create valid Cadence object', () => {
      const cadence = {
        id: 'cad-123',
        name: 'Onboarding Flow',
        steps: [
          {
            id: 'step-1',
            type: 'SEND_EMAIL' as const,
            subject: 'Welcome',
            body: 'Welcome email',
          },
          {
            id: 'step-2',
            type: 'WAIT' as const,
            seconds: 86400,
          },
        ],
      } satisfies Cadence;

      expect(cadence.id).toBe('cad-123');
      expect(cadence.name).toBe('Onboarding Flow');
      expect(cadence.steps).toHaveLength(2);
    });
  });

  describe('CreateCadenceRequest', () => {
    it('should create valid CreateCadenceRequest object', () => {
      const request = {
        name: 'New Cadence',
        steps: [
          {
            id: 'step-1',
            type: 'SEND_EMAIL' as const,
            subject: 'First email',
            body: 'Body text',
          },
        ],
      } satisfies CreateCadenceRequest;

      expect(request.name).toBe('New Cadence');
      expect(request.steps).toHaveLength(1);
    });
  });

  describe('UpdateCadenceRequest', () => {
    it('should create valid UpdateCadenceRequest with name', () => {
      const request = {
        name: 'Updated Name',
        steps: [
          {
            id: 'step-1',
            type: 'WAIT' as const,
            seconds: 3600,
          },
        ],
      } satisfies UpdateCadenceRequest;

      expect(request.name).toBe('Updated Name');
      expect(request.steps).toHaveLength(1);
    });

    it('should create valid UpdateCadenceRequest without name', () => {
      const request = {
        steps: [
          {
            id: 'step-1',
            type: 'SEND_EMAIL' as const,
            subject: 'Updated',
            body: 'Updated body',
          },
        ],
      } satisfies UpdateCadenceRequest;

      expect(request.name).toBeUndefined();
      expect(request.steps).toHaveLength(1);
    });
  });
});

describe('Enrollment Types', () => {
  describe('EnrollmentStatus', () => {
    it('should accept valid enrollment statuses', () => {
      const running: EnrollmentStatus = 'RUNNING';
      const completed: EnrollmentStatus = 'COMPLETED';
      const failed: EnrollmentStatus = 'FAILED';
      const cancelled: EnrollmentStatus = 'CANCELLED';

      expect(running).toBe('RUNNING');
      expect(completed).toBe('COMPLETED');
      expect(failed).toBe('FAILED');
      expect(cancelled).toBe('CANCELLED');
    });
  });

  describe('CreateEnrollmentRequest', () => {
    it('should create valid CreateEnrollmentRequest object', () => {
      const request = {
        cadenceId: 'cad-123',
        contactEmail: 'user@example.com',
      } satisfies CreateEnrollmentRequest;

      expect(request.cadenceId).toBe('cad-123');
      expect(request.contactEmail).toBe('user@example.com');
    });
  });

  describe('Enrollment', () => {
    it('should create valid Enrollment object', () => {
      const enrollment = {
        id: 'enr-456',
        cadenceId: 'cad-123',
        contactEmail: 'user@example.com',
        workflowId: 'wf-789',
      } satisfies Enrollment;

      expect(enrollment.id).toBe('enr-456');
      expect(enrollment.cadenceId).toBe('cad-123');
      expect(enrollment.contactEmail).toBe('user@example.com');
      expect(enrollment.workflowId).toBe('wf-789');
    });
  });

  describe('EnrollmentState', () => {
    it('should create valid EnrollmentState object', () => {
      const state = {
        enrollmentId: 'enr-456',
        cadenceId: 'cad-123',
        contactEmail: 'user@example.com',
        status: 'RUNNING' as const,
        currentStepIndex: 1,
        stepsVersion: 2,
        steps: [
          {
            id: 'step-1',
            type: 'SEND_EMAIL' as const,
            subject: 'Email',
            body: 'Body',
          },
          {
            id: 'step-2',
            type: 'WAIT' as const,
            seconds: 3600,
          },
        ],
      } satisfies EnrollmentState;

      expect(state.enrollmentId).toBe('enr-456');
      expect(state.cadenceId).toBe('cad-123');
      expect(state.contactEmail).toBe('user@example.com');
      expect(state.status).toBe('RUNNING');
      expect(state.currentStepIndex).toBe(1);
      expect(state.stepsVersion).toBe(2);
      expect(state.steps).toHaveLength(2);
    });

    it('should work with different statuses', () => {
      const completedState = {
        enrollmentId: 'enr-1',
        cadenceId: 'cad-1',
        contactEmail: 'test@example.com',
        status: 'COMPLETED' as const,
        currentStepIndex: 3,
        stepsVersion: 1,
        steps: [],
      } satisfies EnrollmentState;

      expect(completedState.status).toBe('COMPLETED');
    });
  });

  describe('UpdateCadenceStepsRequest', () => {
    it('should create valid UpdateCadenceStepsRequest object', () => {
      const request = {
        steps: [
          {
            id: 'step-1',
            type: 'SEND_EMAIL' as const,
            subject: 'Updated',
            body: 'Updated body',
          },
        ],
      } satisfies UpdateCadenceStepsRequest;

      expect(request.steps).toHaveLength(1);
      expect(request.steps[0].type).toBe('SEND_EMAIL');
    });
  });
});

describe('Workflow Types', () => {
  describe('WorkflowState', () => {
    it('should create valid WorkflowState object', () => {
      const state = {
        status: 'RUNNING' as const,
        currentStepIndex: 0,
        stepsVersion: 1,
        steps: [
          {
            id: 'step-1',
            type: 'SEND_EMAIL' as const,
            subject: 'Start',
            body: 'Start body',
          },
        ],
        contactEmail: 'contact@example.com',
        cadenceId: 'cad-123',
      } satisfies WorkflowState;

      expect(state.status).toBe('RUNNING');
      expect(state.currentStepIndex).toBe(0);
      expect(state.stepsVersion).toBe(1);
      expect(state.steps).toHaveLength(1);
      expect(state.contactEmail).toBe('contact@example.com');
      expect(state.cadenceId).toBe('cad-123');
    });

    it('should work with all enrollment statuses', () => {
      const statuses: EnrollmentStatus[] = ['RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'];

      statuses.forEach((status) => {
        const state: WorkflowState = {
          status,
          currentStepIndex: 0,
          stepsVersion: 1,
          steps: [],
          contactEmail: 'test@example.com',
          cadenceId: 'cad-1',
        };

        expect(state.status).toBe(status);
      });
    });
  });

  describe('MockEmailResult', () => {
    it('should create valid MockEmailResult object', () => {
      const result = {
        success: true as const,
        messageId: 'msg-abc123',
        timestamp: 1706745600000,
      } satisfies MockEmailResult;

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-abc123');
      expect(result.timestamp).toBe(1706745600000);
    });
  });

  describe('CadenceWorkflowInput', () => {
    it('should create valid CadenceWorkflowInput object', () => {
      const input = {
        cadence: {
          id: 'cad-123',
          name: 'Test Cadence',
          steps: [
            {
              id: 'step-1',
              type: 'SEND_EMAIL' as const,
              subject: 'Test',
              body: 'Test body',
            },
            {
              id: 'step-2',
              type: 'WAIT' as const,
              seconds: 3600,
            },
          ],
        },
        contactEmail: 'recipient@example.com',
      } satisfies CadenceWorkflowInput;

      expect(input.cadence.id).toBe('cad-123');
      expect(input.cadence.name).toBe('Test Cadence');
      expect(input.cadence.steps).toHaveLength(2);
      expect(input.contactEmail).toBe('recipient@example.com');
    });

    it('should support complex multi-step cadences', () => {
      const input: CadenceWorkflowInput = {
        cadence: {
          id: 'cad-complex',
          name: 'Complex Flow',
          steps: [
            {
              id: 'step-1',
              type: 'SEND_EMAIL',
              subject: 'Day 1',
              body: 'Welcome email',
            },
            {
              id: 'step-2',
              type: 'WAIT',
              seconds: 86400,
            },
            {
              id: 'step-3',
              type: 'SEND_EMAIL',
              subject: 'Day 2',
              body: 'Follow-up email',
            },
            {
              id: 'step-4',
              type: 'WAIT',
              seconds: 172800,
            },
            {
              id: 'step-5',
              type: 'SEND_EMAIL',
              subject: 'Day 4',
              body: 'Final email',
            },
          ],
        },
        contactEmail: 'test@example.com',
      };

      expect(input.cadence.steps).toHaveLength(5);
      expect(input.cadence.steps.filter((s) => s.type === 'SEND_EMAIL')).toHaveLength(3);
      expect(input.cadence.steps.filter((s) => s.type === 'WAIT')).toHaveLength(2);
    });
  });
});

import type { CadenceStep } from "./cadence.types";
import type { EnrollmentStatus } from "./enrollment.types";

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

export interface CadenceWorkflowInput {
  cadence: {
    id: string;
    name: string;
    steps: CadenceStep[];
  };
  contactEmail: string;
}

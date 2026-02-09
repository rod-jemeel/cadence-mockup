import type { CadenceStep } from "./cadence.types";

export type EnrollmentStatus = "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface CreateEnrollmentRequest {
  cadenceId: string;
  contactEmail: string;
}

export interface Enrollment {
  id: string;
  cadenceId: string;
  contactEmail: string;
  workflowId: string;
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

export interface UpdateCadenceStepsRequest {
  steps: CadenceStep[];
}

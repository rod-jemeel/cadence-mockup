import type {
  CreateEnrollmentRequest,
  EnrollmentState,
  UpdateCadenceStepsRequest,
} from "@repo/shared";
import { apiGet, apiPost } from "./client";

interface EnrollmentCreated {
  id: string;
  cadenceId: string;
  contactEmail: string;
  workflowId: string;
}

export async function listEnrollments(): Promise<EnrollmentCreated[]> {
  return apiGet<EnrollmentCreated[]>("/enrollments");
}

export async function createEnrollment(
  data: CreateEnrollmentRequest,
): Promise<EnrollmentCreated> {
  return apiPost<EnrollmentCreated>("/enrollments", data);
}

export async function getEnrollmentState(
  id: string,
): Promise<EnrollmentState> {
  return apiGet<EnrollmentState>(`/enrollments/${id}`);
}

export async function updateEnrollmentCadence(
  id: string,
  data: UpdateCadenceStepsRequest,
): Promise<void> {
  await apiPost<void>(`/enrollments/${id}/update-cadence`, data);
}

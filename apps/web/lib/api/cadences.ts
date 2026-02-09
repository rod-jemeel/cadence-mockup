import type {
  Cadence,
  CreateCadenceRequest,
  UpdateCadenceRequest,
} from "@repo/shared";
import { apiGet, apiPost, apiPut } from "./client";

export async function listCadences(): Promise<Cadence[]> {
  return apiGet<Cadence[]>("/cadences");
}

export async function getCadence(id: string): Promise<Cadence> {
  return apiGet<Cadence>(`/cadences/${id}`);
}

export async function createCadence(
  data: CreateCadenceRequest,
): Promise<Cadence> {
  return apiPost<Cadence>("/cadences", data);
}

export async function updateCadence(
  id: string,
  data: UpdateCadenceRequest,
): Promise<Cadence> {
  return apiPut<Cadence>(`/cadences/${id}`, data);
}

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

export interface CreateCadenceRequest {
  name: string;
  steps: CadenceStep[];
}

export interface UpdateCadenceRequest {
  name?: string;
  steps: CadenceStep[];
}

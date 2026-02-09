import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { EnrollmentState } from '@repo/shared';
import { TemporalService } from '../temporal/temporal.service';
import { CadencesService } from '../cadences/cadences.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateCadenceStepsDto } from './dto/update-cadence-steps.dto';

interface EnrollmentRecord {
  cadenceId: string;
  contactEmail: string;
  workflowId: string;
}

@Injectable()
export class EnrollmentsService {
  private readonly enrollments = new Map<string, EnrollmentRecord>();

  constructor(
    private readonly temporalService: TemporalService,
    private readonly cadencesService: CadencesService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const enrollmentId = uuidv4();
    const cadence = this.cadencesService.findOne(createEnrollmentDto.cadenceId);

    const workflowId = await this.temporalService.startCadenceWorkflow(
      enrollmentId,
      cadence,
      createEnrollmentDto.contactEmail,
    );

    this.enrollments.set(enrollmentId, {
      cadenceId: createEnrollmentDto.cadenceId,
      contactEmail: createEnrollmentDto.contactEmail,
      workflowId,
    });

    return {
      id: enrollmentId,
      cadenceId: createEnrollmentDto.cadenceId,
      contactEmail: createEnrollmentDto.contactEmail,
      workflowId,
    };
  }

  findAll() {
    const results: Array<{ id: string; cadenceId: string; contactEmail: string; workflowId: string }> = [];
    for (const [id, record] of this.enrollments) {
      results.push({
        id,
        cadenceId: record.cadenceId,
        contactEmail: record.contactEmail,
        workflowId: record.workflowId,
      });
    }
    return results;
  }

  async findOne(id: string): Promise<EnrollmentState> {
    const record = this.enrollments.get(id);
    if (!record) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    const workflowState = await this.temporalService.getWorkflowState(record.workflowId);

    return {
      enrollmentId: id,
      cadenceId: record.cadenceId,
      contactEmail: record.contactEmail,
      status: workflowState.status,
      currentStepIndex: workflowState.currentStepIndex,
      stepsVersion: workflowState.stepsVersion,
      steps: workflowState.steps,
    };
  }

  async updateCadenceSteps(
    id: string,
    updateCadenceStepsDto: UpdateCadenceStepsDto,
  ): Promise<EnrollmentState> {
    const record = this.enrollments.get(id);
    if (!record) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    await this.temporalService.updateCadenceSteps(
      record.workflowId,
      updateCadenceStepsDto.steps,
    );

    return this.findOne(id);
  }
}

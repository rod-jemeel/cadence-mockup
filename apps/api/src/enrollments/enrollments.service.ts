import { Injectable, NotFoundException, InternalServerErrorException, ServiceUnavailableException, ConflictException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(EnrollmentsService.name);
  private readonly enrollments = new Map<string, EnrollmentRecord>();

  constructor(
    private readonly temporalService: TemporalService,
    private readonly cadencesService: CadencesService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const enrollmentId = uuidv4();
    const cadence = this.cadencesService.findOne(createEnrollmentDto.cadenceId);

    let workflowId: string;
    try {
      workflowId = await this.temporalService.startCadenceWorkflow(
        enrollmentId,
        cadence,
        createEnrollmentDto.contactEmail,
      );
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(`Failed to start workflow for enrollment ${enrollmentId}`, error);
      throw new InternalServerErrorException('Failed to start enrollment workflow');
    }

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

    try {
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
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to query workflow state for enrollment ${id}`, error);
      throw new InternalServerErrorException('Failed to query workflow state');
    }
  }

  async updateCadenceSteps(
    id: string,
    updateCadenceStepsDto: UpdateCadenceStepsDto,
  ): Promise<EnrollmentState> {
    const record = this.enrollments.get(id);
    if (!record) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    try {
      await this.temporalService.updateCadenceSteps(
        record.workflowId,
        updateCadenceStepsDto.steps,
      );
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof NotFoundException) throw error;
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('not found') || errMsg.includes('completed') || errMsg.includes('terminated')) {
        throw new ConflictException('Workflow has already completed and cannot be updated');
      }
      this.logger.error(`Failed to signal workflow for enrollment ${id}`, error);
      throw new InternalServerErrorException('Failed to update cadence steps');
    }

    return this.findOne(id);
  }
}

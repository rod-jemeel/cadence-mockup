import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from '../enrollments.service';
import { TemporalService } from '../../temporal/temporal.service';
import { CadencesService } from '../../cadences/cadences.service';
import type { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import type { Cadence, WorkflowState } from '@repo/shared';

const mockCadence: Cadence = {
  id: 'cadence-123',
  name: 'Test Cadence',
  steps: [
    { id: 's1', type: 'SEND_EMAIL', subject: 'Welcome', body: 'Hello!' },
    { id: 's2', type: 'WAIT', seconds: 86400 },
  ],
};

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let mockTemporalService: {
    startCadenceWorkflow: ReturnType<typeof vi.fn>;
    getWorkflowState: ReturnType<typeof vi.fn>;
    updateCadenceSteps: ReturnType<typeof vi.fn>;
  };
  let mockCadencesService: {
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockTemporalService = {
      startCadenceWorkflow: vi.fn(),
      getWorkflowState: vi.fn(),
      updateCadenceSteps: vi.fn(),
    };
    mockCadencesService = {
      findOne: vi.fn(),
    };
    service = new EnrollmentsService(
      mockTemporalService as unknown as TemporalService,
      mockCadencesService as unknown as CadencesService,
    );
  });

  describe('findAll', () => {
    it('should return empty array initially', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('should return all created enrollments', async () => {
      mockCadencesService.findOne.mockReturnValue(mockCadence);
      mockTemporalService.startCadenceWorkflow.mockResolvedValue('workflow-1');

      await service.create({ cadenceId: 'cadence-123', contactEmail: 'user1@example.com' });
      mockTemporalService.startCadenceWorkflow.mockResolvedValue('workflow-2');
      await service.create({ cadenceId: 'cadence-123', contactEmail: 'user2@example.com' });

      expect(service.findAll()).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create enrollment and store record', async () => {
      mockCadencesService.findOne.mockReturnValue(mockCadence);
      mockTemporalService.startCadenceWorkflow.mockResolvedValue('workflow-abc-123');

      const createDto: CreateEnrollmentDto = {
        cadenceId: 'cadence-123',
        contactEmail: 'test@example.com',
      };

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id');
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(result.cadenceId).toBe('cadence-123');
      expect(result.contactEmail).toBe('test@example.com');
      expect(result.workflowId).toBe('workflow-abc-123');
    });

    it('should call cadencesService.findOne with correct cadenceId', async () => {
      mockCadencesService.findOne.mockReturnValue(mockCadence);
      mockTemporalService.startCadenceWorkflow.mockResolvedValue('workflow-123');

      await service.create({ cadenceId: 'cadence-123', contactEmail: 'test@example.com' });

      expect(mockCadencesService.findOne).toHaveBeenCalledWith('cadence-123');
    });

    it('should call temporalService.startCadenceWorkflow with correct parameters', async () => {
      mockCadencesService.findOne.mockReturnValue(mockCadence);
      mockTemporalService.startCadenceWorkflow.mockResolvedValue('workflow-123');

      const result = await service.create({ cadenceId: 'cadence-123', contactEmail: 'test@example.com' });

      expect(mockTemporalService.startCadenceWorkflow).toHaveBeenCalledWith(
        result.id,
        mockCadence,
        'test@example.com',
      );
    });
  });

  describe('findOne', () => {
    it('should return EnrollmentState for valid id', async () => {
      mockCadencesService.findOne.mockReturnValue(mockCadence);
      mockTemporalService.startCadenceWorkflow.mockResolvedValue('workflow-123');

      const created = await service.create({ cadenceId: 'cadence-123', contactEmail: 'test@example.com' });

      const mockWorkflowState: WorkflowState = {
        status: 'RUNNING',
        currentStepIndex: 1,
        stepsVersion: 1,
        steps: mockCadence.steps,
        contactEmail: 'test@example.com',
        cadenceId: 'cadence-123',
      };
      mockTemporalService.getWorkflowState.mockResolvedValue(mockWorkflowState);

      const result = await service.findOne(created.id);

      expect(result.enrollmentId).toBe(created.id);
      expect(result.status).toBe('RUNNING');
      expect(result.currentStepIndex).toBe(1);
    });

    it('should call temporalService.getWorkflowState with correct workflowId', async () => {
      mockCadencesService.findOne.mockReturnValue(mockCadence);
      mockTemporalService.startCadenceWorkflow.mockResolvedValue('workflow-abc-123');

      const created = await service.create({ cadenceId: 'cadence-123', contactEmail: 'test@example.com' });

      const mockWorkflowState: WorkflowState = {
        status: 'RUNNING',
        currentStepIndex: 0,
        stepsVersion: 1,
        steps: mockCadence.steps,
        contactEmail: 'test@example.com',
        cadenceId: 'cadence-123',
      };
      mockTemporalService.getWorkflowState.mockResolvedValue(mockWorkflowState);

      await service.findOne(created.id);

      expect(mockTemporalService.getWorkflowState).toHaveBeenCalledWith('workflow-abc-123');
    });

    it('should throw NotFoundException for invalid id', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      await expect(service.findOne(invalidId)).rejects.toThrow(NotFoundException);
    });
  });
});

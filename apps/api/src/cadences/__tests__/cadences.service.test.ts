import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CadencesService } from '../cadences.service';
import type { CreateCadenceDto } from '../dto/create-cadence.dto';
import type { UpdateCadenceDto } from '../dto/update-cadence.dto';
import type { CadenceStep } from '@repo/shared';

const emailStep = (id: string, subject: string): CadenceStep => ({
  id,
  type: 'SEND_EMAIL',
  subject,
  body: `Body for ${subject}`,
});

const waitStep = (id: string, seconds: number): CadenceStep => ({
  id,
  type: 'WAIT',
  seconds,
});

describe('CadencesService', () => {
  let service: CadencesService;

  beforeEach(() => {
    service = new CadencesService();
  });

  describe('create', () => {
    it('should create a cadence with generated id and return it', () => {
      const createDto: CreateCadenceDto = {
        name: 'Test Cadence',
        steps: [emailStep('s1', 'Welcome'), waitStep('s2', 86400)],
      };

      const result = service.create(createDto);

      expect(result).toHaveProperty('id');
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(result.name).toBe(createDto.name);
      expect(result.steps).toEqual(createDto.steps);
    });

    it('should store the created cadence', () => {
      const createDto: CreateCadenceDto = {
        name: 'Test Cadence',
        steps: [emailStep('s1', 'Test')],
      };

      const created = service.create(createDto);
      const found = service.findOne(created.id);

      expect(found).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return empty array initially', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('should return all created cadences', () => {
      const cadence1 = service.create({ name: 'Cadence 1', steps: [emailStep('s1', 'Test 1')] });
      const cadence2 = service.create({ name: 'Cadence 2', steps: [emailStep('s2', 'Test 2')] });

      const result = service.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(cadence1);
      expect(result).toContainEqual(cadence2);
    });
  });

  describe('findOne', () => {
    it('should return cadence by id', () => {
      const created = service.create({ name: 'Test', steps: [emailStep('s1', 'Test')] });
      expect(service.findOne(created.id)).toEqual(created);
    });

    it('should throw NotFoundException for invalid id', () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      expect(() => service.findOne(invalidId)).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update name only', () => {
      const created = service.create({ name: 'Original', steps: [emailStep('s1', 'Test')] });
      const updated = service.update(created.id, { name: 'Updated' });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated');
      expect(updated.steps).toEqual(created.steps);
    });

    it('should update steps only', () => {
      const created = service.create({ name: 'Test', steps: [emailStep('s1', 'Old')] });
      const newSteps: CadenceStep[] = [emailStep('s2', 'New 1'), emailStep('s3', 'New 2')];
      const updated = service.update(created.id, { steps: newSteps });

      expect(updated.name).toBe(created.name);
      expect(updated.steps).toEqual(newSteps);
    });

    it('should update both name and steps', () => {
      const created = service.create({ name: 'Original', steps: [emailStep('s1', 'Test')] });
      const newSteps: CadenceStep[] = [waitStep('s2', 3600)];
      const updated = service.update(created.id, { name: 'Updated', steps: newSteps });

      expect(updated.name).toBe('Updated');
      expect(updated.steps).toEqual(newSteps);
    });

    it('should persist the update', () => {
      const created = service.create({ name: 'Original', steps: [emailStep('s1', 'Test')] });
      service.update(created.id, { name: 'Updated' });
      expect(service.findOne(created.id).name).toBe('Updated');
    });

    it('should throw NotFoundException for invalid id', () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      expect(() => service.update(invalidId, { name: 'X' })).toThrow(NotFoundException);
    });
  });
});

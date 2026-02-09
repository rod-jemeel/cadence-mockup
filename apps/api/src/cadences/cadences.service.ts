import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Cadence } from '@repo/shared';
import { CreateCadenceDto } from './dto/create-cadence.dto';
import { UpdateCadenceDto } from './dto/update-cadence.dto';

@Injectable()
export class CadencesService {
  private readonly cadences = new Map<string, Cadence>();

  findAll(): Cadence[] {
    return Array.from(this.cadences.values());
  }

  create(createCadenceDto: CreateCadenceDto): Cadence {
    const cadence: Cadence = {
      id: uuidv4(),
      name: createCadenceDto.name,
      steps: createCadenceDto.steps,
    };

    this.cadences.set(cadence.id, cadence);
    return cadence;
  }

  findOne(id: string): Cadence {
    const cadence = this.cadences.get(id);
    if (!cadence) {
      throw new NotFoundException(`Cadence with ID ${id} not found`);
    }
    return cadence;
  }

  update(id: string, updateCadenceDto: UpdateCadenceDto): Cadence {
    const cadence = this.findOne(id);

    if (updateCadenceDto.name !== undefined) {
      cadence.name = updateCadenceDto.name;
    }
    if (updateCadenceDto.steps !== undefined) {
      cadence.steps = updateCadenceDto.steps;
    }

    this.cadences.set(id, cadence);
    return cadence;
  }
}

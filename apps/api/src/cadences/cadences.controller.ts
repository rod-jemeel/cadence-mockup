import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import type { Cadence } from '@repo/shared';
import { CadencesService } from './cadences.service';
import { CreateCadenceDto } from './dto/create-cadence.dto';
import { UpdateCadenceDto } from './dto/update-cadence.dto';

@Controller('cadences')
export class CadencesController {
  constructor(private readonly cadencesService: CadencesService) {}

  @Get()
  findAll(): Cadence[] {
    return this.cadencesService.findAll();
  }

  @Post()
  create(@Body() createCadenceDto: CreateCadenceDto): Cadence {
    return this.cadencesService.create(createCadenceDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Cadence {
    return this.cadencesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCadenceDto: UpdateCadenceDto,
  ): Cadence {
    return this.cadencesService.update(id, updateCadenceDto);
  }
}

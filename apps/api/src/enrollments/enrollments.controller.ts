import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import type { EnrollmentState } from '@repo/shared';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateCadenceStepsDto } from './dto/update-cadence-steps.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EnrollmentState> {
    return this.enrollmentsService.findOne(id);
  }

  @Post(':id/update-cadence')
  @HttpCode(HttpStatus.OK)
  async updateCadenceSteps(
    @Param('id') id: string,
    @Body() updateCadenceStepsDto: UpdateCadenceStepsDto,
  ): Promise<EnrollmentState> {
    return this.enrollmentsService.updateCadenceSteps(id, updateCadenceStepsDto);
  }
}

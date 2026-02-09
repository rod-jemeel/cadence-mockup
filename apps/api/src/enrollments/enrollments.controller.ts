import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateCadenceStepsDto } from './dto/update-cadence-steps.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Post(':id/update-cadence')
  updateCadenceSteps(
    @Param('id') id: string,
    @Body() updateCadenceStepsDto: UpdateCadenceStepsDto,
  ) {
    return this.enrollmentsService.updateCadenceSteps(id, updateCadenceStepsDto);
  }
}

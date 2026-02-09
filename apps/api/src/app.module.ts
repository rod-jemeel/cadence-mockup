import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { TemporalModule } from './temporal/temporal.module';
import { CadencesModule } from './cadences/cadences.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TemporalModule,
    CadencesModule,
    EnrollmentsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckInEntity } from 'src/engine/core-modules/field-sales/check-in.entity';
import { RouteEntity } from 'src/engine/core-modules/field-sales/route.entity';
import { StopCoordinatesEntity } from 'src/engine/core-modules/field-sales/stop-coordinates.entity';
import { FieldSalesResolver } from 'src/engine/core-modules/field-sales/field-sales.resolver';
import { FieldSalesService } from 'src/engine/core-modules/field-sales/services/field-sales.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StopCoordinatesEntity,
      RouteEntity,
      CheckInEntity,
    ]),
  ],
  providers: [FieldSalesService, FieldSalesResolver],
  exports: [FieldSalesService],
})
export class FieldSalesModule {}

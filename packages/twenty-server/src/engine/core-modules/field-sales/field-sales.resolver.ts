import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

import { CheckInEntity } from 'src/engine/core-modules/field-sales/check-in.entity';
import {
  CheckOutInput,
  CreateCheckInInput,
  CreateRouteInput,
  OptimizeRouteInput,
  OptimizedRouteResult,
  SaveStopCoordinatesInput,
  UpdateRouteInput,
} from 'src/engine/core-modules/field-sales/dtos/field-sales-inputs.dto';
import { RouteEntity } from 'src/engine/core-modules/field-sales/route.entity';
import { StopCoordinatesEntity } from 'src/engine/core-modules/field-sales/stop-coordinates.entity';
import { FieldSalesService } from 'src/engine/core-modules/field-sales/services/field-sales.service';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class FieldSalesResolver {
  constructor(private readonly fieldSalesService: FieldSalesService) {}

  @Query(() => OptimizedRouteResult)
  async optimizeRoute(
    @Args('input') input: OptimizeRouteInput,
  ): Promise<OptimizedRouteResult> {
    return this.fieldSalesService.optimizeStops(input.coordinates);
  }

  @Query(() => StopCoordinatesEntity, { nullable: true })
  async stopCoordinates(
    @Args('targetId', { type: () => UUIDScalarType }) targetId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<StopCoordinatesEntity | null> {
    return this.fieldSalesService.getStopCoordinates(workspace.id, targetId);
  }

  @Query(() => [StopCoordinatesEntity])
  async stopCoordinatesList(
    @Args('targetIds', { type: () => [UUIDScalarType] }) targetIds: string[],
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<StopCoordinatesEntity[]> {
    return this.fieldSalesService.getStopCoordinatesList(workspace.id, targetIds);
  }

  @Query(() => RouteEntity, { nullable: true })
  async route(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RouteEntity | null> {
    return this.fieldSalesService.getRoute(workspace.id, id);
  }

  @Query(() => [RouteEntity])
  async routes(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RouteEntity[]> {
    return this.fieldSalesService.getRoutes(workspace.id);
  }

  @Query(() => [CheckInEntity])
  async checkInsForRoute(
    @Args('routeId', { type: () => UUIDScalarType }) routeId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CheckInEntity[]> {
    return this.fieldSalesService.getCheckInsForRoute(workspace.id, routeId);
  }

  @Mutation(() => StopCoordinatesEntity)
  async saveStopCoordinates(
    @Args('input') input: SaveStopCoordinatesInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<StopCoordinatesEntity> {
    return this.fieldSalesService.saveStopCoordinates(
      workspace.id,
      input.targetId,
      input.targetType as 'LEAD' | 'ACCOUNT',
      input.latitude,
      input.longitude,
    );
  }

  @Mutation(() => RouteEntity)
  async createRoute(
    @Args('input') input: CreateRouteInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RouteEntity> {
    return this.fieldSalesService.createRoute(workspace.id, {
      name: input.name,
      date: new Date(input.date),
      orderOfStops: input.orderOfStops,
      estimatedDistanceKm: input.estimatedDistanceKm,
      estimatedDurationMin: input.estimatedDurationMin,
      assigneeId: input.assigneeId,
      status: 'DRAFT',
    });
  }

  @Mutation(() => RouteEntity, { nullable: true })
  async updateRoute(
    @Args('input') input: UpdateRouteInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RouteEntity | null> {
    return this.fieldSalesService.updateRoute(workspace.id, input.id, {
      ...(input.name && { name: input.name }),
      ...(input.date && { date: new Date(input.date) }),
      ...(input.status && { status: input.status }),
      ...(input.orderOfStops && { orderOfStops: input.orderOfStops }),
      ...(input.estimatedDistanceKm !== undefined && { estimatedDistanceKm: input.estimatedDistanceKm }),
      ...(input.estimatedDurationMin !== undefined && { estimatedDurationMin: input.estimatedDurationMin }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
    });
  }

  @Mutation(() => Boolean)
  async deleteRoute(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.fieldSalesService.deleteRoute(workspace.id, id);
  }

  @Mutation(() => CheckInEntity)
  async createCheckIn(
    @Args('input') input: CreateCheckInInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CheckInEntity> {
    return this.fieldSalesService.createCheckIn(workspace.id, {
      routeId: input.routeId,
      targetId: input.targetId,
      checkInLat: input.checkInLat,
      checkInLng: input.checkInLng,
      checkInAt: new Date(),
    });
  }

  @Mutation(() => CheckInEntity, { nullable: true })
  async checkOut(
    @Args('input') input: CheckOutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CheckInEntity | null> {
    return this.fieldSalesService.checkOut(
      workspace.id,
      input.id,
      input.checkOutLat,
      input.checkOutLng,
      input.notes,
      input.mediaUrls,
    );
  }
}

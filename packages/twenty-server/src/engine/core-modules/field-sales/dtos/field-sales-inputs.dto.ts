import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CoordinateInput {
  @Field(() => Number)
  latitude: number;

  @Field(() => Number)
  longitude: number;
}

@InputType()
export class OptimizeRouteInput {
  @Field(() => [CoordinateInput])
  coordinates: CoordinateInput[];
}

@ObjectType()
export class OptimizedRouteResult {
  @Field(() => [Number])
  optimizedStopsOrder: number[];

  @Field(() => Number)
  distanceKm: number;

  @Field(() => Number)
  durationMin: number;

  @Field()
  polyline: string;
}

@InputType()
export class SaveStopCoordinatesInput {
  @Field(() => UUIDScalarType)
  targetId: string;

  @Field()
  targetType: string; // 'LEAD' | 'ACCOUNT'

  @Field(() => Number)
  latitude: number;

  @Field(() => Number)
  longitude: number;
}

@InputType()
export class CreateRouteInput {
  @Field()
  name: string;

  @Field(() => Date)
  date: Date;

  @Field(() => [UUIDScalarType])
  orderOfStops: string[];

  @Field(() => Number, { nullable: true })
  estimatedDistanceKm?: number;

  @Field(() => Number, { nullable: true })
  estimatedDurationMin?: number;

  @Field(() => UUIDScalarType, { nullable: true })
  assigneeId?: string;
}

@InputType()
export class UpdateRouteInput {
  @Field(() => UUIDScalarType)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Date, { nullable: true })
  date?: Date;

  @Field({ nullable: true })
  status?: string; // 'DRAFT' | 'ACTIVE' | 'COMPLETED'

  @Field(() => [UUIDScalarType], { nullable: true })
  orderOfStops?: string[];

  @Field(() => Number, { nullable: true })
  estimatedDistanceKm?: number;

  @Field(() => Number, { nullable: true })
  estimatedDurationMin?: number;

  @Field(() => UUIDScalarType, { nullable: true })
  assigneeId?: string;
}

@InputType()
export class CreateCheckInInput {
  @Field(() => UUIDScalarType)
  routeId: string;

  @Field(() => UUIDScalarType)
  targetId: string;

  @Field(() => Number)
  checkInLat: number;

  @Field(() => Number)
  checkInLng: number;
}

@InputType()
export class CheckOutInput {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Number)
  checkOutLat: number;

  @Field(() => Number)
  checkOutLng: number;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String], { nullable: true })
  mediaUrls?: string[];
}
